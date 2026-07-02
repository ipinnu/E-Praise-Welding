"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import {
  GALLERY_CATEGORIES,
  GALLERY_ORIENTATIONS,
  getGalleryImageUrl,
  getGalleryStoragePath,
  type GalleryCategory,
  type GalleryItem,
  type GalleryOrientation,
} from "@/src/lib/gallery";

const emptyDraft: {
  title: string;
  description: string;
  category: GalleryCategory;
  orientation: GalleryOrientation;
} = {
  title: "",
  description: "",
  category: GALLERY_CATEGORIES[0],
  orientation: "portrait",
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<GalleryItem>>({});
  const [newItem, setNewItem] = useState(emptyDraft);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/portal/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profile?.role !== "admin") {
        router.replace("/portal/chat");
      }
    });

    loadItems();
  }, [router]);

  async function loadItems() {
    const supabase = createClient();
    const { data } = await supabase
      .from("gallery_items")
      .select("*")
      .order("order_index", { ascending: true });
    if (data) {
      setItems(
        data.map((item) => ({
          ...item,
          orientation: item.orientation ?? "portrait",
        })) as GalleryItem[],
      );
    }
  }

  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      description: item.description,
      category: item.category,
      orientation: item.orientation ?? "portrait",
    });
    setReplaceFile(null);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
    setReplaceFile(null);
    if (replaceFileRef.current) replaceFileRef.current.value = "";
  };

  async function uploadGalleryImage(file: File) {
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery-images").getPublicUrl(path);

    return publicUrl;
  }

  async function removeStoredImage(imagePath: string) {
    const storagePath = getGalleryStoragePath(imagePath);
    if (!storagePath) return;

    const supabase = createClient();
    await supabase.storage.from("gallery-images").remove([storagePath]);
  }

  const addItem = async () => {
    if (!newFile) {
      setError("Choose an image to upload.");
      return;
    }
    if (!newItem.title.trim()) {
      setError("Title is required.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadGalleryImage(newFile);
      const supabase = createClient();
      const maxOrder = items.reduce(
        (max, item) => Math.max(max, item.order_index),
        0,
      );

      const { data, error: insertError } = await supabase
        .from("gallery_items")
        .insert({
          title: newItem.title.trim(),
          description: newItem.description.trim(),
          category: newItem.category,
          orientation: newItem.orientation,
          size: newItem.orientation === "landscape" ? "large" : "medium",
          image_path: imageUrl,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setItems((prev) => [...prev, data as GalleryItem]);
      setNewItem(emptyDraft);
      setNewFile(null);
      if (newFileRef.current) newFileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async (item: GalleryItem) => {
    setSaving(true);
    setError(null);

    try {
      let imagePath = item.image_path;

      if (replaceFile) {
        await removeStoredImage(item.image_path);
        imagePath = await uploadGalleryImage(replaceFile);
      }

      const supabase = createClient();
      const orientation =
        (draft.orientation as GalleryOrientation) ??
        item.orientation ??
        "portrait";

      const { error: updateError } = await supabase
        .from("gallery_items")
        .update({
          title: draft.title?.trim() || item.title,
          description: draft.description ?? item.description,
          category: draft.category ?? item.category,
          orientation,
          size: orientation === "landscape" ? "large" : "medium",
          image_path: imagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                ...draft,
                orientation,
                image_path: imagePath,
              }
            : it,
        ),
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item: GalleryItem) => {
    if (!confirm(`Delete "${item.title}" from the gallery?`)) return;

    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await removeStoredImage(item.image_path);
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    if (editingId === item.id) cancelEdit();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 border-black bg-white">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="E-Praise Welding"
            width={36}
            height={36}
          />
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
            Upload project photos, choose vertical or horizontal display, and
            edit details for the public gallery.
          </p>
        </div>

        {error && (
          <div className="mb-4 border-2 border-red-500 bg-red-50 px-4 py-3 font-kanit text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-10 border-2 border-black p-5 md:p-6 bg-yellow-DEFAULT/10">
          <h2 className="font-kanit font-black text-lg uppercase text-black mb-4">
            Add Gallery Image
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                Image
              </label>
              <input
                ref={newFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                className="block w-full font-kanit text-sm text-black file:mr-4 file:border-2 file:border-black file:bg-white file:px-4 file:py-2 file:font-kanit file:font-bold file:text-xs file:uppercase file:tracking-widest file:cursor-pointer"
              />
            </div>
            <div>
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                Title
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem((item) => ({ ...item, title: e.target.value }))
                }
                className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT"
              />
            </div>
            <div>
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                Category
              </label>
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((item) => ({
                    ...item,
                    category: e.target.value as GalleryCategory,
                  }))
                }
                className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT bg-white"
              >
                {GALLERY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                Description
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem((item) => ({
                    ...item,
                    description: e.target.value,
                  }))
                }
                rows={2}
                className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-2">
                Gallery Display
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GALLERY_ORIENTATIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`border-2 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                      newItem.orientation === option.value
                        ? "border-black bg-yellow-DEFAULT"
                        : "border-black/20 bg-white hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="new-orientation"
                      value={option.value}
                      checked={newItem.orientation === option.value}
                      onChange={() =>
                        setNewItem((item) => ({
                          ...item,
                          orientation: option.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="font-kanit font-black text-sm uppercase text-black block">
                      {option.label}
                    </span>
                    <span className="font-kanit text-black/50 text-xs">
                      {option.hint}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={addItem}
            disabled={uploading}
            className="mt-5 bg-black text-yellow-DEFAULT font-kanit font-bold text-xs uppercase tracking-widest px-6 py-3 border-2 border-black hover:bg-yellow-DEFAULT hover:text-black transition-colors duration-150 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Add to Gallery"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border-2 border-black overflow-hidden">
              <div
                className={`bg-black relative overflow-hidden ${
                  item.orientation === "landscape" ? "aspect-[16/10]" : "aspect-[3/4]"
                }`}
              >
                <img
                  src={getGalleryImageUrl(item.image_path)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                  <span className="font-kanit font-bold text-xs uppercase tracking-widest px-2 py-0.5 bg-black/60 text-white border border-white/30">
                    {item.category}
                  </span>
                  <span className="font-kanit font-bold text-xs uppercase tracking-widest px-2 py-0.5 bg-yellow-DEFAULT text-black border border-black">
                    {item.orientation === "landscape" ? "Horizontal" : "Vertical"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                        Replace Image
                      </label>
                      <input
                        ref={replaceFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setReplaceFile(e.target.files?.[0] ?? null)
                        }
                        className="block w-full font-kanit text-xs text-black file:mr-3 file:border file:border-black file:bg-white file:px-3 file:py-1.5 file:font-kanit file:font-bold file:uppercase file:tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={draft.title ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT"
                      />
                    </div>
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-1">
                        Description
                      </label>
                      <textarea
                        value={draft.description ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            description: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            category: e.target.value as GalleryCategory,
                          }))
                        }
                        className="w-full border-2 border-black px-3 py-2 font-kanit text-sm text-black outline-none focus:border-yellow-DEFAULT bg-white"
                      >
                        {GALLERY_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 block mb-2">
                        Gallery Display
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {GALLERY_ORIENTATIONS.map((option) => (
                          <label
                            key={option.value}
                            className={`border-2 px-3 py-2 cursor-pointer text-center ${
                              draft.orientation === option.value
                                ? "border-black bg-yellow-DEFAULT"
                                : "border-black/20 bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`orientation-${item.id}`}
                              value={option.value}
                              checked={draft.orientation === option.value}
                              onChange={() =>
                                setDraft((d) => ({
                                  ...d,
                                  orientation: option.value,
                                }))
                              }
                              className="sr-only"
                            />
                            <span className="font-kanit font-bold text-xs uppercase text-black">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(item)}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 bg-white text-black font-kanit font-bold text-xs uppercase tracking-widest py-2 border-2 border-black hover:bg-yellow-DEFAULT transition-colors duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        className="flex-1 bg-white text-red-600 font-kanit font-bold text-xs uppercase tracking-widest py-2 border-2 border-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </div>
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
