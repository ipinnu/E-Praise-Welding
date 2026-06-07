"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);
}



export default function AboutPage() {
  useScrollReveal();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-on-scroll.delay-1 { transition-delay: 0.1s; }
        .reveal-on-scroll.delay-2 { transition-delay: 0.2s; }
        .reveal-on-scroll.delay-3 { transition-delay: 0.3s; }
        .reveal-on-scroll.delay-4 { transition-delay: 0.4s; }

        .hero-line {
          width: 0;
          animation: expandLine 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        @keyframes expandLine {
          to { width: 100%; }
        }

.timeline-item {
          position: relative;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #FFD700;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .timeline-item.is-visible::before {
          transform: scaleY(1);
        }
      `}</style>
      <Header />

      {/* ── PAGE HERO ── (yellow background) */}
      <section className="bg-black pt-32 pb-20 px-6 md:px-10 relative overflow-hidden border-b-2 border-white/10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff, #fff 2px, transparent 2px, transparent 30px)",
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
              Our Story
            </span>
          </div>

          <h1
            className="font-kanit font-black text-white leading-none mb-6"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            ABOUT
            <br />
            <span className="text-white/60">E-PRAISE</span>
          </h1>

          <div className="hero-line h-0.5 bg-white/20 mb-8" />

          <p
            className="font-kanit text-white/70 text-lg max-w-2xl"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both",
            }}
          >
            Founded on a passion for metalwork and a commitment to excellence.
            We&apos;ve been shaping steel into structures and art since 2017.
          </p>
        </div>
      </section>

      {/* ── MISSION STATEMENT ── (white background) */}
      <section className="bg-white py-20 px-6 md:px-10 border-y-2 border-black">
        <div className="max-w-screen-xl mx-auto">
          <div className="max-w-4xl">
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-6">
              Our Mission
            </span>
            <blockquote className="font-kanit font-black text-black text-3xl md:text-5xl leading-tight uppercase">
              TO TRANSFORM RAW METAL INTO WORKS THAT STAND THE TEST OF
              TIME — BOTH IN STRENGTH AND IN BEAUTY.
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-0.5 bg-yellow-DEFAULT" />
              <span className="font-kanit font-bold text-black/60 text-sm uppercase tracking-widest">
                Emmanuel Praise, Founder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY ── (white background) */}
      <section className="bg-white py-24 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="reveal-on-scroll">
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-4">
              Who We Are
            </span>
            <h2 className="font-kanit font-black text-black leading-none mb-8">
              BUILT ON
              <br />
              <span className="relative inline-block">
                PASSION
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-yellow-DEFAULT" />
              </span>
            </h2>
            <div className="space-y-4">
              <p className="font-kanit text-black/70 text-base leading-relaxed">
                E-Praise Welding was born in 2017 from a single workshop, a
                handful of tools, and an unshakeable belief that metalwork could
                be both functional and beautiful. Our founder, Emmanuel Praise,
                started with structural welding contracts before expanding into
                custom fabrication and eventually sculpture design.
              </p>
              <p className="font-kanit text-black/70 text-base leading-relaxed">
                Today, we operate a fully equipped facility serving contractors,
                architects, homeowners, and artists across the region.
              </p>
              <p className="font-kanit text-black/70 text-base leading-relaxed">
                Every project — from a simple repair to a monumental sculpture —
                receives the same level of care, precision, and dedication that
                has defined E-Praise Welding from day one.
              </p>
            </div>
          </div>

          {/* Visual block — yellow/white stats */}
          <div className="reveal-on-scroll delay-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black border-2 border-white/20 p-8 flex flex-col justify-between h-48">
                <span className="font-kanit font-black text-white text-5xl leading-none">
                  100+
                </span>
                <span className="font-kanit font-medium text-white/60 text-sm uppercase tracking-widest">
                  Projects Done
                </span>
              </div>
              <div className="bg-white border-2 border-black p-8 flex flex-col justify-between h-48">
                <span className="font-kanit font-black text-black text-5xl leading-none">
                  10+
                </span>
                <span className="font-kanit font-medium text-black/60 text-sm uppercase tracking-widest">
                  Years Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


{/* ── VALUES ── (yellow background) */}
      <section className="bg-black py-20 px-6 md:px-10 border-y-2 border-white/10">
        <div className="max-w-screen-xl mx-auto">
          <div className="reveal-on-scroll mb-12">
            <h2 className="font-kanit font-black text-white leading-none">
              OUR VALUES
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                title: "Precision",
                desc: "Every measurement, every cut, every weld executed to exact specification.",
              },
              {
                title: "Integrity",
                desc: "Honest pricing, transparent timelines, and work we stand behind unconditionally.",
              },
              {
                title: "Artistry",
                desc: "We believe functional metalwork can also be beautiful. We never compromise on either.",
              },
            ]?.map((val, i) => (
              <div
                key={i}
                className={`reveal-on-scroll delay-${i + 1} border-2 border-white/20 p-10 bg-white/5 hover:bg-white/10 group transition-colors duration-300`}
              >
                <span className="font-kanit font-black text-white/10 text-7xl leading-none block mb-4 transition-colors duration-300">
                  {String(i + 1)?.padStart(2, "0")}
                </span>
                <h3 className="font-kanit font-black text-white text-2xl uppercase mb-4 transition-colors duration-300">
                  {val?.title}
                </h3>
                <p className="font-kanit text-white/70 text-sm transition-colors duration-300">
                  {val?.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── (white background) */}
      <section className="bg-white py-24 px-6 md:px-10 border-b-2 border-black">
        <div className="max-w-screen-xl mx-auto text-center">
          <div className="reveal-on-scroll">
            <h2 className="font-kanit font-black text-black leading-none mb-6">
              LET US BUILD
              <br />
              <span className="text-yellow-DEFAULT">TOGETHER</span>
            </h2>
            <p className="font-kanit text-black/50 text-base max-w-lg mx-auto mb-10">
              Whether you need structural steel or a one-of-a-kind sculpture, we
              are ready to bring your vision to life.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest px-10 py-5 border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150"
              >
                Contact Us →
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-black font-kanit font-bold text-sm uppercase tracking-widest border-b-2 border-black pb-1 hover:border-yellow-DEFAULT hover:text-yellow-DEFAULT transition-all duration-200"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
