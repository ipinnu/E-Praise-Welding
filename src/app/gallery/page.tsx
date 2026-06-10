"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { createClient } from "@/src/lib/supabase/client";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_path: string;
  category: string;
  size: "large" | "medium" | "small";
  order_index: number;
}

const categories = [
  "All",
  "Fabrication",
  "Sculpture",
  "Structural",
  "Ornamental",
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    supabase
      .from("gallery_items")
      .select("*")
      .order("order_index", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Gallery fetch error:", error);
          setFetchError(error.message);
        } else {
          setItems((data ?? []) as GalleryItem[]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.id || "";
            setVisibleItems((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    itemRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, activeCategory]);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const handleWantThis = (item: GalleryItem) => {
    if (isLoggedIn) {
      router.push(
        `/portal/chat?context=${encodeURIComponent("Gallery: " + item.title)}`,
      );
    } else {
      router.push(
        `/contact?ref=${encodeURIComponent(item.title)}`,
      );
    }
  };

  return (
    <>
      <style>{`
        .gallery-item {
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-item.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }
        .gallery-item:hover .gallery-img {
          transform: scale(1.05);
        }
        .gallery-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gallery-img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .category-btn {
          transition: all 0.2s ease;
        }
        .category-btn.active {
          background-color: #000;
          color: #FFD700;
          border-color: #000;
        }
        .category-btn:not(.active):hover {
          border-color: #000;
          background-color: #FFD700;
        }

        .hero-line {
          width: 0;
          animation: expandLine 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        @keyframes expandLine {
          to { width: 100%; }
        }
      `}</style>

      <Header />

      {/* PAGE HERO */}
      <section className="bg-black pt-32 pb-20 px-6 md:px-10 relative overflow-hidden border-b-2 border-white/10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #fff, #fff 2px, transparent 2px, transparent 30px)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div
            className="flex items-center gap-3 mb-6"
            style={{ animation: "fadeIn 0.6s ease 0.2s both" }}
          >
            <div className="w-8 h-0.5 bg-yellow-DEFAULT" />
            <span className="font-kanit font-semibold text-yellow-DEFAULT text-xs uppercase tracking-widest">
              Our Portfolio
            </span>
          </div>

          <h1
            className="font-kanit font-black text-white leading-none mb-6"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            PROJECT
            <br />
            <span className="text-white/60">GALLERY</span>
          </h1>

          <div className="hero-line h-0.5 bg-white/20 mb-8" />

          <p
            className="font-kanit text-white/70 text-lg max-w-2xl"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both",
            }}
          >
            A showcase of our finest work — from industrial fabrication to
            sculptural art. Every project tells a story of precision and
            passion.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="bg-white border-b-2 border-black sticky top-[60px] z-30">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="font-kanit font-black text-xs uppercase tracking-widest text-black/30 whitespace-nowrap mr-2">
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setVisibleItems(new Set());
              }}
              className={`category-btn font-kanit font-bold text-xs uppercase tracking-widest px-4 py-2 border-2 border-black/20 whitespace-nowrap ${activeCategory === cat ? "active" : "text-black/60"}`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto font-kanit text-black/30 text-xs uppercase tracking-widest whitespace-nowrap">
            {filtered.length} Projects
          </span>
        </div>
      </div>

      {/* GALLERY */}
      <section className="bg-white py-12 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto">
          {loading ? (
            <div className="py-24 text-center">
              <p className="font-kanit font-bold text-black/30 text-xl uppercase tracking-widest">
                Loading gallery...
              </p>
            </div>
          ) : fetchError ? (
            <div className="py-24 text-center">
              <p className="font-kanit font-bold text-red-500 text-sm uppercase tracking-widest mb-2">
                Failed to load gallery
              </p>
              <p className="font-kanit text-black/40 text-xs">{fetchError}</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
              {filtered.map((item, i) => (
                <div
                  key={`${item.id}-${activeCategory}`}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el);
                  }}
                  data-id={item.id}
                  className="gallery-item break-inside-avoid border-2 border-black relative overflow-hidden group cursor-pointer bg-black"
                  style={{ transitionDelay: `${(i % 6) * 0.08}s` }}
                  onClick={() => handleWantThis(item)}
                >
                  {/* Real image — natural proportions, visible on load */}
                  <img
                    src={`/assets/${encodeURIComponent(item.image_path)}`}
                    alt={item.title}
                    className="gallery-img w-full h-auto block"
                    onLoad={(e) => {
                      const card = (e.target as HTMLImageElement).closest(".gallery-item");
                      card?.classList.add("visible");
                    }}
                  />

                  {/* Dark scrim so category badge is readable */}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="font-kanit font-bold text-xs uppercase tracking-widest px-2 py-1 border border-white/60 text-white bg-black/40">
                      {item.category}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="gallery-overlay absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 z-20">
                    <h4 className="font-kanit font-black text-white text-xl uppercase text-center mb-2">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="font-kanit text-white/60 text-xs text-center max-w-[200px] mb-3">
                        {item.description}
                      </p>
                    )}
                    <span className="font-kanit text-yellow-DEFAULT text-xs uppercase tracking-widest">
                      {item.category}
                    </span>
                    <div className="mt-4 w-8 h-0.5 bg-yellow-DEFAULT" />
                    <span className="mt-4 font-kanit font-bold text-xs uppercase tracking-widest text-yellow-DEFAULT border border-yellow-DEFAULT px-3 py-1">
                      {isLoggedIn ? "Inquire in Portal →" : "I Want This →"}
                    </span>
                  </div>

                  {/* Number */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="font-kanit font-black text-4xl leading-none opacity-20 text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length > 0 && filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="font-kanit font-bold text-black/30 text-xl uppercase tracking-widest">
                No projects in this category yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* COMMISSION CTA */}
      <section className="bg-black py-20 px-6 md:px-10 border-y-2 border-white/10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-white/50 block mb-3">
              Commission Work
            </span>
            <h2 className="font-kanit font-black text-white leading-none">
              WANT SOMETHING
              <br />
              LIKE THIS?
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-kanit text-white/70 text-base max-w-sm">
              Every project in our gallery started with a conversation. Let us
              talk about yours.
            </p>
            {isLoggedIn ? (
              <Link
                href="/portal/chat?context=Custom+Project"
                className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest px-8 py-4 border-2 border-yellow-DEFAULT shadow-[4px_4px_0_rgba(255,215,0,0.3)] hover:shadow-[2px_2px_0_rgba(255,215,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                Start a Project in Portal →
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/contact?ref=Custom+Project"
                  className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest px-8 py-4 border-2 border-yellow-DEFAULT shadow-[4px_4px_0_rgba(255,215,0,0.3)] hover:shadow-[2px_2px_0_rgba(255,215,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                >
                  Start a Project →
                </Link>
                <p className="font-kanit text-white/40 text-xs">
                  Have an account?{" "}
                  <Link href="/portal/login" className="text-yellow-DEFAULT underline">
                    Sign in
                  </Link>{" "}
                  to chat directly with us.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
