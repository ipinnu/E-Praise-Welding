"use client";
import React, { useEffect, useRef, useState } from "react"; // useState kept for Counter component
import Link from "next/link";
import Image from "next/image";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";

// â"€â"€ Scroll reveal hook â"€â"€
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// â"€â"€ Animated counter â"€â"€
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// â"€â"€ Marquee ticker â"€â"€
const tickerItems = [
  "Metal Welding",
  "Custom Fabrication",
  "Sculpture Design",
  "Structural Steel",
  "Ornamental Iron",
  "Artistic Metalwork",
  "Industrial Welding",
  "Architectural Metal",
  "Bespoke Creations",
];

const services = [
  {
    id: "01",
    title: "Metal Welding",
    desc: "Precision MIG, TIG, and arc welding for structural and decorative applications. Every weld is tested for strength and aesthetics.",
    icon: "🔧",
    size: "large",
  },
  {
    id: "02",
    title: "Custom Fabrication",
    desc: "From concept to completion — gates, railings, frames, and industrial components built to exact specifications.",
    icon: "🔧",
    size: "small",
  },
  {
    id: "03",
    title: "Sculpture Design",
    desc: "Transforming raw metal into art. Commissions for public spaces and private collections.",
    icon: "🎨",
    size: "small",
  },
  {
    id: "04",
    title: "Structural Steel",
    desc: "Heavy-duty steel construction for commercial and residential projects. Built to code, built to last decades.",
    icon: "🏗️",
    size: "large",
  },
];

const stats = [
  { value: 100, suffix: "+", label: "Projects Completed" },
  { value: 5, suffix: "yrs", label: "Years Experience" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

export default function HomePage() {
  useScrollReveal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current)
        videoRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    };
    const handleMouse = (e: MouseEvent) => {
      if (gridRef.current) {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        gridRef.current.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
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
        .reveal-on-scroll.delay-5 { transition-delay: 0.5s; }

        .hero-char {
          display: inline-block;
          opacity: 0;
          transform: translateY(60px) rotate(4deg);
          animation: charReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes charReveal {
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }

        .ticker-wrap {
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-inner {
          display: inline-flex;
          animation: ticker 30s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .bento-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .bento-card:hover {
          transform: translateY(-6px);
          box-shadow: 8px 8px 0 #000;
        }

        .spark-line {
          position: relative;
          overflow: hidden;
        }
        .spark-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: sparkSweep 3s ease-in-out infinite;
        }
        @keyframes sparkSweep {
          0% { left: -60%; }
          100% { left: 110%; }
        }

        .video-overlay {
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.4) 0%,
            rgba(0,0,0,0.2) 40%,
            rgba(0,0,0,0.5) 100%
          );
        }

        .parallax-text {
          will-change: transform;
        }

        .yellow-depth {
          background: linear-gradient(
            160deg,
            #FFFDE7 0%,
            #FFD700 35%,
            #FFD700 65%,
            #FFFDE7 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(2px 4px 0px rgba(0, 0, 0, 0.5));
        }
      `}</style>

      <Header />

      {/* â"€â"€ HERO â"€â"€ */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-black">
        {/* Background video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          style={{ willChange: "transform" }}
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay — top and bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

        {/* Vignette overlay */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />

        {/* Animated grid lines */}
        <div
          ref={gridRef}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Yellow corner accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-yellow-DEFAULT opacity-90"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-screen-xl mx-auto">
          <div className="max-w-4xl">
            {/* Label */}
            <div
              className="flex items-center gap-3 mb-6"
              style={{ animation: "fadeIn 0.6s ease 0.2s both" }}
            >
              <div className="w-8 h-0.5 bg-yellow-DEFAULT" />
              <span className="font-kanit font-semibold text-yellow-DEFAULT text-xs uppercase tracking-widest">
                Est. 2017 · Premium Metal Works
              </span>
            </div>

            {/* Main heading */}
            <h1 className="font-kanit font-black text-white leading-none mb-6 overflow-hidden">
              {"FORGED IN".split("").map((char, i) => (
                <span
                  key={i}
                  className="hero-char"
                  style={{ animationDelay: `${0.3 + i * 0.04}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
              <br />
              <span className="text-yellow-DEFAULT">
                {"FIRE.".split("").map((char, i) => (
                  <span
                    key={i}
                    className="hero-char"
                    style={{ animationDelay: `${0.7 + i * 0.06}s` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="font-kanit font-medium text-white/80 text-lg md:text-xl max-w-xl mb-10"
              style={{
                animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 1.2s both",
              }}
            >
              Metal welding, custom fabrication, and sculpture design that
              transforms raw steel into lasting works of art and structure.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-4"
              style={{
                animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 1.4s both",
              }}
            >
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest px-8 py-4 border-2 border-yellow-DEFAULT shadow-[4px_4px_0_rgba(255,215,0,0.4)] hover:shadow-[2px_2px_0_rgba(255,215,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                Our Services
                <span className="text-lg">→</span>
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 bg-transparent text-white font-kanit font-bold text-sm uppercase tracking-widest px-8 py-4 border-2 border-white/60 hover:border-yellow-DEFAULT hover:text-yellow-DEFAULT transition-all duration-200"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animation: "fadeIn 1s ease 2s both" }}
        >
          <span className="font-kanit text-white/40 text-xs uppercase tracking-widest">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* â"€â"€ STATS â"€â"€ (white background, yellow numbers) */}
      <section className="bg-white border-b-2 border-black">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3">
          {stats?.map((stat, i) => (
            <div
              key={i}
              className={`reveal-on-scroll delay-${i + 1} flex flex-col justify-center items-center py-16 px-10 ${
                i < stats.length - 1
                  ? "border-b-2 md:border-b-0 md:border-r-2 border-black"
                  : ""
              }`}
            >
              <div className="yellow-depth font-kanit font-black text-7xl md:text-8xl leading-none mb-3">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-kanit font-semibold text-black text-xs uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â"€â"€ SERVICES BENTO â"€â"€ (white background) */}
      <section className="bg-white py-24 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="reveal-on-scroll">
              <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-yellow-DEFAULT block mb-3">
                What We Do
              </span>
              <h2 className="font-kanit font-black text-black leading-none">
                OUR
                <br />
                SERVICES
              </h2>
            </div>
            <div className="reveal-on-scroll delay-2 max-w-sm">
              <p className="font-kanit text-black/60 text-base leading-relaxed">
                From structural steel to ornamental sculpture — we handle every
                aspect of metal work with precision and artistry.
              </p>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card — black */}
            <div className="reveal-on-scroll md:col-span-2 bento-card bg-black border-2 border-black p-8 md:p-12 min-h-[280px] flex flex-col justify-between group cursor-pointer">
              <div>
                <span className="font-kanit font-black text-white/20 text-5xl leading-none">
                  01
                </span>
                <h3 className="font-kanit font-black text-white text-3xl md:text-4xl mt-4 mb-4 uppercase">
                  Metal Welding
                </h3>
                <p className="font-kanit text-white/70 text-base max-w-md">
                  Precision MIG, TIG, and arc welding for structural and
                  decorative applications. Every weld is tested for strength and
                  aesthetics.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Link
                  href="/services"
                  className="font-kanit font-bold text-white text-sm uppercase tracking-widest hover:gap-5 transition-all duration-200 flex items-center gap-2"
                >
                  Learn More <span>→</span>
                </Link>
              </div>
            </div>

            {/* Small card — white */}
            <div className="reveal-on-scroll delay-1 bento-card bg-white border-2 border-black p-8 min-h-[280px] flex flex-col justify-between group cursor-pointer hover:bg-black transition-colors duration-300">
              <div>
                <span className="font-kanit font-black text-black/10 group-hover:text-white/20 text-5xl leading-none transition-colors duration-300">
                  02
                </span>
                <h3 className="font-kanit font-black text-black group-hover:text-white text-2xl mt-4 mb-4 uppercase transition-colors duration-300">
                  Custom Fabrication
                </h3>
                <p className="font-kanit text-black/60 group-hover:text-white/70 text-sm transition-colors duration-300">
                  Gates, railings, frames, and industrial components built to
                  exact specifications.
                </p>
              </div>
              <Link
                href="/services"
                className="font-kanit font-bold text-black group-hover:text-white text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all duration-200"
              >
                Learn More <span>→</span>
              </Link>
            </div>

            {/* Small card — black */}
            <div className="reveal-on-scroll delay-2 bento-card bg-black border-2 border-black p-8 min-h-[280px] flex flex-col justify-between group cursor-pointer">
              <div>
                <span className="font-kanit font-black text-white/10 text-5xl leading-none">
                  03
                </span>
                <h3 className="font-kanit font-black text-white text-2xl mt-4 mb-4 uppercase">
                  Sculpture Design
                </h3>
                <p className="font-kanit text-white/70 text-sm">
                  Transforming raw metal into art. Commissions for public spaces
                  and private collections.
                </p>
              </div>
              <Link
                href="/services"
                className="font-kanit font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all duration-200"
              >
                Learn More <span>→</span>
              </Link>
            </div>

            {/* Large card — white */}
            <div className="reveal-on-scroll delay-3 md:col-span-2 bento-card bg-white border-2 border-black p-8 md:p-12 min-h-[280px] flex flex-col justify-between group cursor-pointer hover:bg-black transition-colors duration-300">
              <div>
                <span className="font-kanit font-black text-black/10 group-hover:text-white/20 text-5xl leading-none transition-colors duration-300">
                  04
                </span>
                <h3 className="font-kanit font-black text-black group-hover:text-white text-3xl md:text-4xl mt-4 mb-4 uppercase transition-colors duration-300">
                  Structural Steel
                </h3>
                <p className="font-kanit text-black/60 group-hover:text-white/70 text-base max-w-md transition-colors duration-300">
                  Heavy-duty steel construction for commercial and residential
                  projects. Built to code, built to last decades.
                </p>
              </div>
              <Link
                href="/services"
                className="font-kanit font-bold text-black group-hover:text-white text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all duration-200"
              >
                Learn More <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* â"€â"€ PROCESS â"€â"€ (yellow background) */}
      <section className="bg-black py-24 px-6 md:px-10 relative overflow-hidden border-y-2 border-black">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff, #fff 10px, transparent 10px, transparent 40px)",
          }}
        />
        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="reveal-on-scroll mb-16">
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-white/50 block mb-3">
              How It Works
            </span>
            <h2 className="font-kanit font-black text-white leading-none">
              THE PROCESS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {[
              {
                step: "01",
                title: "Consultation",
                desc: "We discuss your vision, requirements, and budget in detail.",
              },
              {
                step: "02",
                title: "Design",
                desc: "Our team creates detailed drawings and 3D models for approval.",
              },
              {
                step: "03",
                title: "Fabrication",
                desc: "Skilled craftsmen bring your design to life in our workshop.",
              },
              {
                step: "04",
                title: "Delivery",
                desc: "Professional installation and finishing on-site.",
              },
            ]?.map((item, i) => (
              <div
                key={i}
                className={`reveal-on-scroll delay-${i + 1} relative border-2 border-white/20 p-8 bg-black/50 group hover:bg-white/10 transition-colors duration-300`}
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-px w-px h-full bg-black z-10" />
                )}
                <span className="font-kanit font-black text-6xl text-white/10 leading-none block mb-4 transition-colors duration-300">
                  {item.step}
                </span>
                <h4 className="font-kanit font-black text-white text-xl uppercase mb-3 transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="font-kanit text-white/70 text-sm transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â"€â"€ GALLERY PREVIEW â"€â"€ (white background) */}
      <section className="bg-white py-24 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="reveal-on-scroll">
              <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-yellow-DEFAULT block mb-3">
                Our Work
              </span>
              <h2 className="font-kanit font-black text-black leading-none">
                RECENT
                <br />
                PROJECTS
              </h2>
            </div>
            <Link
              href="/gallery"
              className="reveal-on-scroll delay-2 inline-flex items-center gap-2 font-kanit font-bold text-sm uppercase tracking-widest text-black border-b border-black/30 pb-1 hover:border-yellow-DEFAULT hover:text-yellow-DEFAULT transition-all duration-200"
            >
              View All Work →
            </Link>
          </div>

          {/* Asymmetric gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                img: "/assets/Gate-opt.jpeg",
                span: "md:col-span-2 md:row-span-2",
                h: "h-64 md:h-auto",
                label: "Custom Gate Installation",
              },
              {
                img: "/assets/Aesthetic pieces.WEBP",
                span: "",
                h: "h-48",
                label: "Steel Sculpture",
              },
              {
                img: "/assets/Metal design front entrance.WEBP",
                span: "",
                h: "h-48",
                label: "Ornamental Railing",
              },
              {
                img: "/assets/Water tank structure.jpeg",
                span: "",
                h: "h-48",
                label: "Industrial Frame",
              },
              {
                img: "/assets/Wardrobe-opt.jpeg",
                span: "",
                h: "h-48",
                label: "Wardrobe Frame",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`reveal-on-scroll delay-${i + 1} ${item.span} ${item.h} border-2 border-black relative overflow-hidden group cursor-pointer bg-black`}
              >
                <Image
                  src={item.img}
                  alt={item.label}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="font-kanit font-bold text-white text-sm uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â"€â"€ CTA BANNER â"€â"€ (yellow background) */}
      <section className="bg-black py-24 px-6 md:px-10 relative overflow-hidden border-y-2 border-white/10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff, #fff 10px, transparent 10px, transparent 40px)",
          }}
        />
        <div className="relative z-10 max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="reveal-on-scroll">
            <h2 className="font-kanit font-black text-white leading-none mb-4">
              READY TO
              <br />
              <span className="text-yellow-DEFAULT">BUILD SOMETHING</span>
              <br />
              EXTRAORDINARY?
            </h2>
            <p className="font-kanit text-white/60 text-base max-w-md leading-relaxed">
              Contact us today for a free consultation and quote. We bring your
              metal vision to life.
            </p>
          </div>
          <div className="reveal-on-scroll delay-2 flex flex-col gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-black text-white font-kanit font-black text-sm uppercase tracking-widest px-10 py-5 border-2 border-black shadow-[6px_6px_0_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.3)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 whitespace-nowrap"
            >
              Get a Free Quote
              <span className="text-xl">→</span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 text-white font-kanit font-bold text-sm uppercase tracking-widest border-b-2 border-white/60 pb-1 hover:border-yellow-DEFAULT hover:text-yellow-DEFAULT transition-all duration-200"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
