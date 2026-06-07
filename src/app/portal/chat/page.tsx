"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import type { Message, Profile } from "@/src/lib/supabase/types";

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-yellow-DEFAULT rounded-full animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const contextLabel = searchParams.get("context");
  const router = useRouter();

  const supabase = createClient();
  const [user, setUser] = useState<Profile | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(contextLabel ? `I'm interested in ${contextLabel}` : "");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load current user + admin ID + messages
  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/portal/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setUser(profile);

      const { data: admin } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .single();
      if (!admin) { setLoading(false); return; }
      setAdminId(admin.id);

      await fetchMessages(authUser.id, admin.id);
      setLoading(false);
    }
    init();
  }, []);

  const fetchMessages = useCallback(async (clientId: string, aId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*, attachments(*)")
      .or(
        `and(sender_id.eq.${clientId},recipient_id.eq.${aId}),and(sender_id.eq.${aId},recipient_id.eq.${clientId})`
      )
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  }, [supabase]);

  // Mark messages as read + real-time subscription
  useEffect(() => {
    if (!user || !adminId) return;

    // Mark unread messages from admin as read
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", adminId)
      .eq("recipient_id", user.id)
      .is("read_at", null)
      .then(() => {});

    const channel = supabase
      .channel("chat:" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => fetchMessages(user.id, adminId),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, adminId, fetchMessages, supabase]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || !user || !adminId || sending) return;

    setSending(true);
    const text = input.trim();
    setInput("");

    const msgPayload: Record<string, unknown> = {
      sender_id: user.id,
      recipient_id: adminId,
      content: text,
    };
    if (contextLabel && messages.length === 0) {
      msgPayload.context_label = contextLabel;
    }

    const { data: msg, error } = await supabase
      .from("messages")
      .insert(msgPayload)
      .select()
      .single();

    if (!error && msg) {
      setMessages((prev) => [...prev, msg]);
      // Notify admin via API
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_message",
          senderName: user.full_name || user.email,
          content: text,
          messageId: msg.id,
          recipientRole: "admin",
        }),
      }).catch(() => {});
    }

    setSending(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !adminId) return;

    setUploading(true);

    // First create the message
    const { data: msg, error: msgError } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: adminId,
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

    await fetchMessages(user.id, adminId);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 border-black bg-white z-10 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="E-Praise Welding" width={36} height={36} />
          <div className="flex flex-col leading-none">
            <span className="font-kanit font-black text-sm uppercase tracking-wider text-black">
              E-Praise
            </span>
            <span className="font-kanit font-medium text-xs uppercase tracking-widest text-yellow-DEFAULT">
              Welding
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-kanit text-black/40 text-xs uppercase tracking-widest hidden sm:block">
            {user?.full_name || user?.email}
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
            <div className="w-16 h-16 bg-yellow-DEFAULT border-2 border-black flex items-center justify-center mb-6">
              <span className="font-kanit font-black text-2xl text-black">EP</span>
            </div>
            <h3 className="font-kanit font-black text-xl uppercase text-black mb-2">
              Start a Conversation
            </h3>
            <p className="font-kanit text-black/50 text-sm max-w-xs">
              Describe what you&apos;re looking for and we&apos;ll get back to you.
            </p>
            {contextLabel && (
              <div className="mt-4 inline-flex items-center gap-2 bg-yellow-DEFAULT border-2 border-black px-4 py-2">
                <span className="font-kanit font-bold text-xs uppercase tracking-widest text-black">
                  {contextLabel}
                </span>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}
            >
              {msg.context_label && (
                <span className="font-kanit font-bold text-xs uppercase tracking-widest bg-yellow-DEFAULT border border-black px-2 py-0.5 text-black mb-1">
                  {msg.context_label}
                </span>
              )}
              <div
                className={`px-4 py-3 border-2 border-black ${
                  isOwn
                    ? "bg-yellow-DEFAULT text-black shadow-[3px_3px_0_#000]"
                    : "bg-black text-white shadow-[3px_3px_0_#FFD700]"
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
                        className={`flex items-center gap-2 text-sm font-kanit font-bold underline ${isOwn ? "text-black" : "text-yellow-DEFAULT"}`}
                      >
                        <span className="text-base">📎</span>
                        {att.file_name}
                      </a>
                    ))}
                    {/* If it's an image, show preview */}
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
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full px-4 py-3 font-kanit text-sm resize-none focus:outline-none bg-white placeholder:text-black/30"
              style={{ minHeight: "48px", maxHeight: "160px" }}
            />
          </div>

          {/* Attach file */}
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
            title="Attach image"
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
  );
}
