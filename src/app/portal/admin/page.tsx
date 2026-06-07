import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/portal/chat");

  // Fetch all clients who have sent at least one message
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  // For each client, get their latest message + unread count
  const clientsWithThreads = await Promise.all(
    (clients ?? []).map(async (client) => {
      const { data: latest } = await supabase
        .from("messages")
        .select("content, created_at, context_label")
        .or(
          `and(sender_id.eq.${client.id},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${client.id})`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count: unread } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", client.id)
        .eq("recipient_id", user.id)
        .is("read_at", null);

      return { ...client, latest, unread: unread ?? 0 };
    }),
  );

  // Sort: clients with messages first, then by latest message time
  const sorted = clientsWithThreads.sort((a, b) => {
    if (!a.latest && !b.latest) return 0;
    if (!a.latest) return 1;
    if (!b.latest) return -1;
    return (
      new Date(b.latest.created_at).getTime() -
      new Date(a.latest.created_at).getTime()
    );
  });

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 border-black bg-white">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="E-Praise Welding" width={36} height={36} />
          <div className="flex flex-col leading-none">
            <span className="font-kanit font-black text-sm uppercase tracking-wider text-black">E-Praise</span>
            <span className="font-kanit font-medium text-xs uppercase tracking-widest text-yellow-DEFAULT">Welding</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-kanit font-bold text-xs uppercase tracking-widest bg-yellow-DEFAULT border border-black px-3 py-1 text-black">
            Admin
          </span>
          <form action="/api/signout" method="POST">
            <Link
              href="/api/signout"
              className="font-kanit font-bold text-xs uppercase tracking-widest text-black/50 hover:text-black border-b border-black/20 hover:border-black transition-all duration-150"
            >
              Sign Out
            </Link>
          </form>
        </div>
      </div>

      {/* Inbox */}
      <div className="max-w-3xl w-full mx-auto px-4 md:px-8 py-8 flex-1">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-1">
              Inbox
            </span>
            <h1 className="font-kanit font-black text-3xl uppercase text-black">
              Client Threads
            </h1>
          </div>
          <Link
            href="/portal/admin/gallery"
            className="shrink-0 inline-flex items-center gap-2 bg-black text-yellow-DEFAULT font-kanit font-bold text-xs uppercase tracking-widest px-5 py-2.5 border-2 border-black shadow-[3px_3px_0_rgba(255,215,0,0.4)] hover:shadow-[1px_1px_0_rgba(255,215,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
          >
            Manage Gallery
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="border-2 border-black p-12 text-center">
            <p className="font-kanit font-bold text-black/30 uppercase tracking-widest">
              No clients yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col border-t-2 border-black">
            {sorted.map((client) => (
              <Link
                key={client.id}
                href={`/portal/admin/${client.id}`}
                className="flex items-center gap-4 px-4 py-5 border-b-2 border-black hover:bg-yellow-DEFAULT transition-colors duration-150 group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-kanit font-black text-sm uppercase shrink-0">
                  {(client.full_name || client.email || "?")[0].toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-kanit font-black text-sm uppercase text-black">
                      {client.full_name || client.email}
                    </span>
                    {client.latest?.context_label && (
                      <span className="font-kanit font-bold text-xs bg-yellow-DEFAULT group-hover:bg-black group-hover:text-yellow-DEFAULT border border-black px-2 py-0.5 uppercase tracking-wider text-black transition-colors duration-150">
                        {client.latest.context_label}
                      </span>
                    )}
                  </div>
                  {client.latest ? (
                    <p className="font-kanit text-xs text-black/50 truncate">
                      {client.latest.content}
                    </p>
                  ) : (
                    <p className="font-kanit text-xs text-black/30 italic">
                      No messages yet
                    </p>
                  )}
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {client.latest && (
                    <span className="font-kanit text-xs text-black/40">
                      {formatTime(client.latest.created_at)}
                    </span>
                  )}
                  {client.unread > 0 && (
                    <span className="w-5 h-5 bg-black text-white font-kanit font-black text-xs flex items-center justify-center">
                      {client.unread}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
