"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { getGalleryImageUrl } from "@/src/lib/gallery";
import type { Message, Profile } from "@/src/lib/supabase/types";

interface GalleryItem {
  id: string;
  title: string;
  image_path: string;
  category: string;
}

export default function AdminThreadPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const router = useRouter();

  const supabase = createClient();
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteLines, setQuoteLines] = useState([{ description: "", quantity: "", amount: "" }]);
  const [quoteNote, setQuoteNote] = useState("");
  const [sendingQuote, setSendingQuote] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal/login"); return; }

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (adminProfile?.role !== "admin") { router.push("/portal/chat"); return; }
      setAdmin(adminProfile);

      const { data: clientProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientId)
        .single();
      setClient(clientProfile);

      await fetchMessages(user.id, clientId);

      const { data: gItems } = await supabase
        .from("gallery_items")
        .select("id, title, image_path, category")
        .order("order_index", { ascending: true })
        .limit(16);
      setGalleryItems(gItems ?? []);

      setLoading(false);
    }
    init();
  }, [clientId]);

  const fetchMessages = useCallback(async (adminUid: string, cId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*, attachments(*)")
      .or(
        `and(sender_id.eq.${cId},recipient_id.eq.${adminUid}),and(sender_id.eq.${adminUid},recipient_id.eq.${cId})`
      )
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  }, [supabase]);

  useEffect(() => {
    if (!admin || !clientId) return;

    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", clientId)
      .eq("recipient_id", admin.id)
      .is("read_at", null)
      .then(() => {});

    const channel = supabase
      .channel("admin-thread:" + clientId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${clientId}`,
        },
        () => fetchMessages(admin.id, clientId),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [admin, clientId, fetchMessages, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || !admin || !clientId || sending) return;

    setSending(true);
    const text = input.trim();
    setInput("");

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({ sender_id: admin.id, recipient_id: clientId, content: text })
      .select()
      .single();

    if (!error && msg) {
      setMessages((prev) => [...prev, msg]);
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_message",
          senderName: "E-Praise Welding",
          content: text,
          messageId: msg.id,
          recipientId: clientId,
          recipientRole: "client",
        }),
      }).catch(() => {});
    }

    setSending(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !admin) return;

    setUploading(true);

    const { data: msg, error: msgError } = await supabase
      .from("messages")
      .insert({
        sender_id: admin.id,
        recipient_id: clientId,
        content: `[Attached: ${file.name}]`,
      })
      .select()
      .single();

    if (msgError || !msg) { setUploading(false); return; }

    const path = `${msg.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(path, file);

    if (uploadError) { setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage
      .from("chat-attachments")
      .getPublicUrl(path);

    await supabase.from("attachments").insert({
      message_id: msg.id,
      storage_url: publicUrl,
      file_name: file.name,
    });

    await fetchMessages(admin.id, clientId);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function sendQuote() {
    if (!admin || !clientId || sendingQuote) return;
    const validLines = quoteLines.filter((l) => l.description.trim());
    if (validLines.length === 0) return;

    setSendingQuote(true);

    const lineTotal = (l: { quantity: string; amount: string }) => {
      const price = parseFloat(l.amount) || 0;
      const qty = parseFloat(l.quantity);
      if (!price) return 0;
      return qty > 0 ? qty * price : price;
    };

    const total = validLines.reduce((sum, l) => sum + lineTotal(l), 0);
    const lineText = validLines
      .map((l) => {
        const qty = parseFloat(l.quantity);
        const totalForLine = lineTotal(l);
        let text = `• ${l.description}`;
        if (qty > 0) text += ` × ${qty}`;
        if (totalForLine > 0) text += ` — ₦${totalForLine.toLocaleString()}`;
        return text;
      })
      .join("\n");
    const content = [
      quoteNote.trim() ? quoteNote.trim() : null,
      lineText,
      total > 0 ? `\nTotal: ₦${total.toLocaleString()}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        sender_id: admin.id,
        recipient_id: clientId,
        content,
        context_label: "QUOTE_REQUEST",
      })
      .select()
      .single();

    if (!error && msg) {
      setMessages((prev) => [...prev, msg]);
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_message",
          senderName: "E-Praise Welding",
          content: "A quote has been sent. Please review and sign.",
          messageId: msg.id,
          recipientId: clientId,
          recipientRole: "client",
        }),
      }).catch(() => {});
    }

    setShowQuoteForm(false);
    setQuoteLines([{ description: "", quantity: "", amount: "" }]);
    setQuoteNote("");
    setSendingQuote(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
          " " +
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-yellow-DEFAULT rounded-full animate-spin" />
      </div>
    );
  }

  const panelImages = messages.flatMap((msg) =>
    (msg.attachments ?? []).filter((att) => /\.(png|jpe?g|gif|webp)$/i.test(att.file_name))
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── LEFT: Chat ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 border-black bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/admin"
              className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors duration-150 flex items-center gap-1"
            >
              ← Inbox
            </Link>
            <span className="text-black/20">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-yellow-DEFAULT flex items-center justify-center font-kanit font-black text-xs uppercase">
                {(client?.full_name || client?.email || "?")[0].toUpperCase()}
              </div>
              <div>
                <span className="font-kanit font-black text-sm uppercase text-black block leading-none">
                  {client?.full_name || client?.email}
                </span>
                {client?.email && client?.full_name && (
                  <span className="font-kanit text-xs text-black/40">{client.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQuoteForm((v) => !v)}
              className={`font-kanit font-bold text-xs uppercase tracking-widest px-4 py-1.5 border-2 transition-all duration-150 hidden sm:block ${
                showQuoteForm
                  ? "bg-black text-yellow-DEFAULT border-black"
                  : "bg-yellow-DEFAULT text-black border-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
            >
              {showQuoteForm ? "✕ Cancel Quote" : "Send Quote"}
            </button>
            <span className="font-kanit font-bold text-xs uppercase tracking-widest bg-yellow-DEFAULT border border-black px-3 py-1 text-black hidden sm:block">
              Admin
            </span>
            <button
              onClick={signOut}
              className="font-kanit font-bold text-xs uppercase tracking-widest text-black/50 hover:text-black border-b border-black/20 hover:border-black transition-all duration-150"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <p className="font-kanit font-bold text-black/30 uppercase tracking-widest text-sm">
                No messages yet.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.sender_id === admin?.id;
            const isQuote = msg.context_label === "QUOTE_REQUEST";
            const signature = (msg.attachments ?? []).find((a) => a.file_name.startsWith("signature_"));

            // ── Quote / Contract card ──
            if (isQuote) {
              return (
                <div key={msg.id} className="self-end w-full max-w-lg ml-auto">
                  <div className="border-2 border-black bg-white shadow-[4px_4px_0_#FFD700]">
                    <div className="bg-black px-5 py-3 flex items-center justify-between">
                      <span className="font-kanit font-black text-xs uppercase tracking-widest text-yellow-DEFAULT">
                        Quote Sent
                      </span>
                      <span className="font-kanit text-xs text-white/40">{formatTime(msg.created_at)}</span>
                    </div>
                    <div className="px-5 py-4 border-b-2 border-black">
                      <p className="font-kanit text-sm text-black leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <div className="px-5 py-4">
                      {signature ? (
                        <div>
                          <span className="font-kanit font-black text-xs uppercase tracking-widest text-black/40 block mb-3">
                            Client Signed ✓
                          </span>
                          <img
                            src={signature.storage_url}
                            alt="Client Signature"
                            className="max-h-20 border border-black/10"
                          />
                        </div>
                      ) : (
                        <span className="font-kanit text-xs text-black/30 uppercase tracking-widest">
                          Awaiting signature…
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // ── Regular message ──
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}
              >
                {msg.context_label && msg.context_label !== "QUOTE_REQUEST" && (
                  <span className="font-kanit font-bold text-xs uppercase tracking-widest bg-yellow-DEFAULT border border-black px-2 py-0.5 text-black mb-1">
                    {msg.context_label}
                  </span>
                )}
                <div
                  className={`px-4 py-3 border-2 border-black ${
                    isOwn
                      ? "bg-black text-white shadow-[3px_3px_0_#FFD700]"
                      : "bg-yellow-DEFAULT text-black shadow-[3px_3px_0_#000]"
                  }`}
                >
                  {msg.attachments && msg.attachments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 text-sm font-kanit font-bold underline ${isOwn ? "text-yellow-DEFAULT" : "text-black"}`}
                        >
                          <span className="text-base">📎</span>
                          {att.file_name}
                        </a>
                      ))}
                      {msg.attachments.map((att) =>
                        /\.(png|jpe?g|gif|webp)$/i.test(att.file_name) ? (
                          <Image
                            key={att.id + "-img"}
                            src={att.storage_url}
                            alt={att.file_name}
                            width={300}
                            height={200}
                            className="max-w-full border border-current"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : null
                      )}
                    </div>
                  ) : (
                    <p className="font-kanit text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                </div>
                <span className="font-kanit text-black/30 text-xs">{formatTime(msg.created_at)}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quote Composer */}
        {showQuoteForm && (
          <div className="border-t-2 border-black bg-white px-4 md:px-8 py-5 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="font-kanit font-black text-sm uppercase tracking-widest text-black">
                Compose Quote
              </span>
              <span className="font-kanit text-xs text-black/40 uppercase tracking-widest">
                Client will sign before work begins
              </span>
            </div>

            {/* Note / intro */}
            <textarea
              value={quoteNote}
              onChange={(e) => setQuoteNote(e.target.value)}
              placeholder="Opening note (optional) — e.g. 'Here is your quote for the custom gate project…'"
              rows={6}
              className="w-full min-h-[9rem] border-2 border-black px-3 py-2 font-kanit text-sm resize-y focus:outline-none focus:border-yellow-DEFAULT transition-colors mb-3 placeholder:text-black/30"
            />

            {/* Line items */}
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex gap-2 items-center px-0.5">
                <span className="flex-1 font-kanit text-xs uppercase tracking-widest text-black/40">
                  Material
                </span>
                <span className="w-16 font-kanit text-xs uppercase tracking-widest text-black/40 text-center">
                  Qty
                </span>
                <span className="w-32 font-kanit text-xs uppercase tracking-widest text-black/40">
                  Price
                </span>
                {quoteLines.length > 1 && <span className="w-8" />}
              </div>
              {quoteLines.map((line, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => {
                      const updated = [...quoteLines];
                      updated[i].description = e.target.value;
                      setQuoteLines(updated);
                    }}
                    placeholder={`Item ${i + 1} description`}
                    className="flex-1 border-2 border-black px-3 py-2 font-kanit text-sm focus:outline-none focus:border-yellow-DEFAULT transition-colors placeholder:text-black/30"
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={line.quantity}
                    onChange={(e) => {
                      const updated = [...quoteLines];
                      updated[i].quantity = e.target.value;
                      setQuoteLines(updated);
                    }}
                    placeholder="Qty"
                    className="w-16 border-2 border-black px-2 py-2 font-kanit text-sm text-center focus:outline-none focus:border-yellow-DEFAULT transition-colors placeholder:text-black/30"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-kanit text-sm text-black/40">₦</span>
                    <input
                      type="number"
                      value={line.amount}
                      onChange={(e) => {
                        const updated = [...quoteLines];
                        updated[i].amount = e.target.value;
                        setQuoteLines(updated);
                      }}
                      placeholder="0"
                      className="w-32 border-2 border-black pl-7 pr-3 py-2 font-kanit text-sm focus:outline-none focus:border-yellow-DEFAULT transition-colors placeholder:text-black/30"
                    />
                  </div>
                  {quoteLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuoteLines(quoteLines.filter((_, j) => j !== i))}
                      className="w-8 h-10 flex items-center justify-center text-black/30 hover:text-black transition-colors font-kanit font-bold text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total preview */}
            {quoteLines.some((l) => l.amount) && (
              <div className="flex justify-end mb-3">
                <div className="bg-black text-white font-kanit font-black text-sm px-4 py-2 border-2 border-black">
                  Total: ₦{quoteLines.reduce((s, l) => {
                    const price = parseFloat(l.amount) || 0;
                    const qty = parseFloat(l.quantity);
                    return s + (price ? (qty > 0 ? qty * price : price) : 0);
                  }, 0).toLocaleString()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setQuoteLines([...quoteLines, { description: "", quantity: "", amount: "" }])}
                className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 hover:text-black border-b border-black/20 hover:border-black transition-all duration-150"
              >
                + Add Line
              </button>
              <button
                type="button"
                onClick={sendQuote}
                disabled={sendingQuote || quoteLines.every((l) => !l.description.trim())}
                className="font-kanit font-black text-xs uppercase tracking-widest px-8 py-3 bg-yellow-DEFAULT text-black border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0"
              >
                {sendingQuote ? "Sending…" : "Send Quote →"}
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t-2 border-black bg-white px-4 md:px-8 py-4 shrink-0">
          <form onSubmit={sendMessage} className="flex gap-3 items-end">
            <div className="flex-1 border-2 border-black focus-within:border-yellow-DEFAULT transition-colors duration-150">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Reply to client… (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="w-full px-4 py-3 font-kanit text-sm resize-none focus:outline-none bg-white placeholder:text-black/30"
                style={{ minHeight: "48px", maxHeight: "160px" }}
              />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Attach design"
              className="w-12 h-12 border-2 border-black flex items-center justify-center hover:bg-yellow-DEFAULT transition-colors duration-150 disabled:opacity-40 shrink-0"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-lg">📎</span>
              )}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="h-12 px-6 bg-yellow-DEFAULT text-black font-kanit font-black text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 shrink-0"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: Side Panel ── */}
      <aside className="hidden lg:flex flex-col w-72 border-l-2 border-black bg-white shrink-0">
        {/* Panel header */}
        <div className="px-5 py-4 border-b-2 border-black shrink-0">
          <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-0.5">
            {panelImages.length > 0 ? "This Project" : "Our Work"}
          </span>
          <h3 className="font-kanit font-black text-base uppercase text-black">
            {panelImages.length > 0 ? "Project Files" : "Portfolio"}
          </h3>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto">
          {panelImages.length > 0 ? (
            <div className="flex flex-col">
              {panelImages.map((img) => (
                <a
                  key={img.id}
                  href={img.storage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border-b-2 border-black block"
                >
                  <div className="relative h-44 overflow-hidden bg-black">
                    <img
                      src={img.storage_url}
                      alt={img.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <div className="px-4 py-2.5 flex items-center gap-2 bg-white group-hover:bg-yellow-DEFAULT transition-colors duration-150">
                    <span className="font-kanit text-xs text-black/60 truncate flex-1">{img.file_name}</span>
                    <span className="font-kanit font-bold text-xs text-black/30 group-hover:text-black transition-colors">↗</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div>
              <p className="px-5 pt-4 pb-3 font-kanit text-xs text-black/40 leading-relaxed">
                Attach project images to this thread to see them here.
              </p>
              <div className="grid grid-cols-2">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden border-b border-r border-black/10 bg-black"
                    style={{ height: "112px" }}
                  >
                    <img
                      src={getGalleryImageUrl(item.image_path)}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors duration-200 flex items-end p-2">
                      <span className="font-kanit font-bold text-white text-xs uppercase leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

    </div>
  );
}
