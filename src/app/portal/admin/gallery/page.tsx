"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_path: string;
  category: string;
  size: string;
  order_index: number;
}

const CATEGORIES = ["Fabrication", "Sculpture", "Structural", "Ornamental"];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<GalleryItem>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/portal/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profile?.role !== "admin") { router.replace("/portal/chat"); return; }
    });

    supabase
      .from("gallery_items")
      .select("*")
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as GalleryItem[]);
      });
  }, [router]);

  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setDraft({ title: item.title, description: item.description, category: item.category });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("gallery_items")
      .update({ ...draft, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...draft } : it)),
    );
    setEditingId(null);
    setDraft({});
  };

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
          <Link
            href="/portal/admin"
            className="font-kanit font-bold text-xs uppercase tracking-widest text-black/50 hover:text-black border-b border-black/20 hover:border-black transition-all duration-150"
          >
            Back to Inbox
          </Link>
          <span className="font-kanit font-bold text-xs uppercase tracking-widest bg-yellow-DEFAULT border border-black px-3 py-1 text-black">
            Admin
          </span>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 md:px-8 py-8 flex-1">
        <div className="mb-8">
          <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-1">
            Admin
          </span>
          <h1 className="font-kanit font-black text-3xl uppercase text-black">
            Manage Gallery
          </h1>
          <p className="font-kanit text-black/50 text-sm mt-2">
            {items.length} items — click Edit to update title, description, or category.
          </p>
        </div>

        {error && (
          <div className="mb-4 border-2 border-red-500 bg-red-50 px-4 py-3 font-kanit text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border-2 border-black overflow-hidden">
              {/* Image */}
              <div className="h-48 bg-black relative overflow-hidden">
                <img
                  src={`/assets/${encodeURIComponent(item.image_path)}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="font-kanit font-bold text-xs uppercase tracking-widest px-2 py-0.5 bg-black/60 text-white border border-white/30">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={draft.title ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT"
                      />
                    </div>
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                        Description
                      </label>
                      <textarea
                        value={draft.description ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                        rows={2}
                        className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT resize-none"
                      />
                    </div>
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                        Category
                      </label>
                      <select
                        value={draft.category ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                        className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(item.id)}
                        disabled={saving}
                        className="flex-1 bg-black text-yellow-DEFAULT font-kanit font-bold text-xs uppercase tracking-widest py-2 border-2 border-black hover:bg-yellow-DEFAULT hover:text-black transition-colors duration-150 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-white text-black font-kanit font-bold text-xs uppercase tracking-widest py-2 border-2 border-black hover:bg-black/5 transition-colors duration-150"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-kanit font-black text-sm uppercase text-black mb-1 truncate">
                      {item.title}
                    </h3>
                    <p className="font-kanit text-black/50 text-xs mb-3 line-clamp-2 min-h-[2rem]">
                      {item.description || "No description"}
                    </p>
                    <button
                      onClick={() => startEdit(item)}
                      className="w-full bg-white text-black font-kanit font-bold text-xs uppercase tracking-widest py-2 border-2 border-black hover:bg-yellow-DEFAULT transition-colors duration-150"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
