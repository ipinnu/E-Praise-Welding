"use client";
import React, { useEffect, useRef, useState } from "react";
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
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

interface Service {
  id: string;
  title: string;
  tagline: string;
  desc: string;
  features: string[];
  accent: string;
}

const services: Service[] = [
  {
    id: "01",
    title: "Metal Welding",
    tagline: "Precision. Strength. Permanence.",
    desc: "Our certified welders use MIG, TIG, and arc welding techniques to create bonds that outlast the structure itself. From thin-gauge decorative work to heavy structural joins, every weld is executed with precision and inspected for integrity.",
    features: [
      "MIG & TIG Welding",
      "Structural Welding",
      "Pipe Welding",
      "Stainless & Aluminum",
      "On-site Welding",
      "Weld Inspection",
    ],
    accent: "bg-yellow-DEFAULT",
  },
  {
    id: "02",
    title: "Custom Fabrication",
    tagline: "Your Vision. Our Craft.",
    desc: "We take your concept from sketch to finished product. Custom gates, security doors, railings, staircases, industrial frames, and architectural elements — all fabricated in our fully equipped workshop to exact specifications.",
    features: [
      "Custom Gates & Doors",
      "Railings & Balustrades",
      "Steel Staircases",
      "Industrial Frames",
      "Architectural Elements",
      "CNC Cutting",
    ],
    accent: "bg-white",
  },
  {
    id: "03",
    title: "Sculpture Design",
    tagline: "Metal as Art.",
    desc: "We transform raw steel, iron, and mixed metals into sculptural works of art. Public installations, corporate commissions, garden sculptures, and abstract pieces — each one a unique collaboration between your vision and our craftsmanship.",
    features: [
      "Public Art Installations",
      "Corporate Commissions",
      "Garden Sculptures",
      "Abstract Metalwork",
      "Mixed Media",
      "Restoration",
    ],
    accent: "bg-yellow-DEFAULT",
  },
  {
    id: "04",
    title: "Structural Steel",
    tagline: "Built to Code. Built to Last.",
    desc: "Heavy-duty structural steel work for commercial, industrial, and residential construction. We fabricate and install steel beams, columns, trusses, and frameworks that meet all building codes and engineering specifications.",
    features: [
      "Steel Beams & Columns",
      "Roof Trusses",
      "Mezzanine Floors",
      "Industrial Shelving",
      "Building Frameworks",
      "Certified Installation",
    ],
    accent: "bg-white",
  },
  {
    id: "05",
    title: "Ornamental Iron",
    tagline: "Elegance in Iron.",
    desc: "Decorative ironwork that combines traditional craftsmanship with modern design sensibility. Fences, window guards, pergolas, furniture frames, and decorative panels that add character and security to any property.",
    features: [
      "Decorative Fencing",
      "Window Guards",
      "Pergolas & Arbors",
      "Furniture Frames",
      "Decorative Panels",
      "Powder Coating",
    ],
    accent: "bg-yellow-DEFAULT",
  },
  {
    id: "06",
    title: "Maintenance & Repair",
    tagline: "Restore. Reinforce. Renew.",
    desc: "Existing metalwork that needs attention? We repair, reinforce, and restore metal structures and decorative pieces. From rust treatment to structural reinforcement, we extend the life of your metal investments.",
    features: [
      "Rust Treatment",
      "Structural Repair",
      "Welding Repairs",
      "Surface Restoration",
      "Protective Coating",
      "Emergency Repairs",
    ],
    accent: "bg-white",
  },
];

export default function ServicesPage() {
  useScrollReveal();
  const [activeService, setActiveService] = useState<number | null>(null);
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
        .reveal-on-scroll.delay-5 { transition-delay: 0.5s; }

        .service-row {
          transition: background-color 0.3s ease;
        }
        .service-row:hover {
          background-color: #FFD700;
        }
        .service-row.active {
          background-color: #FFD700;
        }

        .feature-tag {
          transition: all 0.2s ease;
        }
        .feature-tag:hover {
          background-color: #000;
          color: #FFD700;
        }

        .hero-line {
          width: 0;
          animation: expandLine 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        @keyframes expandLine {
          to { width: 100%; }
        }

        .number-reveal {
          opacity: 0;
          animation: numberReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes numberReveal {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Header />

      {/* â”€â”€ PAGE HERO â”€â”€ (yellow background) */}
      <section className="bg-black pt-32 pb-20 px-6 md:px-10 relative overflow-hidden border-b-2 border-white/10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff, #fff 2px, transparent 2px, transparent 30px)",
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
              What We Offer
            </span>
          </div>

          <h1
            className="font-kanit font-black text-white leading-none mb-6"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            OUR
            <br />
            <span className="text-white/60">SERVICES</span>
          </h1>

          <div className="hero-line h-0.5 bg-white/20 mb-8" />

          <p
            className="font-kanit text-white/70 text-lg max-w-2xl"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both",
            }}
          >
            From structural steel to ornamental sculpture — six core services
            delivered with uncompromising craftsmanship and attention to detail.
          </p>
        </div>
      </section>

      {/* â”€â”€ SERVICE INDEX â”€â”€ (white background) */}
      <section className="bg-white border-b-2 border-black">
        <div className="max-w-screen-xl mx-auto">
          {services?.map((service, i) => (
            <div
              key={service.id}
              className={`service-row border-b-2 border-black cursor-pointer ${activeService === i ? "active" : ""}`}
              onClick={() => setActiveService(activeService === i ? null : i)}
            >
              {/* Row header */}
              <div className="px-6 md:px-10 py-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 md:gap-10">
                  <span
                    className={`font-kanit font-black text-2xl md:text-3xl number-reveal ${activeService === i ? "text-black" : "text-black/20"}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {service.id}
                  </span>
                  <h3 className="font-kanit font-black text-xl md:text-3xl uppercase text-black">
                    {service.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden md:block font-kanit text-black/40 text-sm italic">
                    {service.tagline}
                  </span>
                  <div
                    className={`w-8 h-8 border-2 border-black flex items-center justify-center transition-transform duration-300 ${activeService === i ? "rotate-45 bg-black" : "bg-transparent"}`}
                  >
                    <span
                      className={`font-kanit font-black text-lg leading-none ${activeService === i ? "text-yellow-DEFAULT" : "text-black"}`}
                    >
                      +
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              <div
                className={`overflow-hidden transition-all duration-500 ${activeService === i ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-6 md:px-10 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-black/10 pt-6">
                  <div>
                    <p className="font-kanit text-black/70 text-base leading-relaxed mb-6">
                      {service.desc}
                    </p>
                    <Link
                      href={`/portal/inquiry?context=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-bold text-xs uppercase tracking-widest px-6 py-3 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                    >
                      Request This Service →
                    </Link>
                  </div>
                  <div>
                    <span className="font-kanit font-black text-xs uppercase tracking-widest text-black/40 block mb-4">
                      Includes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {service.features?.map((feat, j) => (
                        <span
                          key={j}
                          className="feature-tag font-kanit font-semibold text-xs uppercase tracking-wider text-black border-2 border-black px-3 py-1.5 cursor-default"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ WHY CHOOSE US â”€â”€ (white background, yellow cards) */}
      <section className="bg-white py-24 px-6 md:px-10 border-b-2 border-black">
        <div className="max-w-screen-xl mx-auto">
          <div className="reveal-on-scroll mb-16">
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-3">
              Why E-Praise
            </span>
            <h2 className="font-kanit font-black text-black leading-none">
              WHY CHOOSE US
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {[
              {
                title: "Certified Welders",
                desc: "All our welders hold industry certifications and undergo continuous training.",
              },
              {
                title: "Premium Materials",
                desc: "We source only high-grade steel, iron, and alloys from trusted suppliers.",
              },
              {
                title: "On-Time Delivery",
                desc: "We respect your timeline. Projects delivered on schedule, every time.",
              },
              {
                title: "Custom Solutions",
                desc: "No two projects are the same. Every solution is tailored to your needs.",
              },
              {
                title: "Competitive Pricing",
                desc: "Premium quality at fair prices. Detailed quotes with no hidden costs.",
              },
              {
                title: "5-Year Warranty",
                desc: "We stand behind our work with a comprehensive 5-year structural warranty.",
              },
            ]?.map((item, i) => (
              <div
                key={i}
                className={`reveal-on-scroll delay-${(i % 3) + 1} border-2 border-black p-8 bg-white hover:bg-yellow-DEFAULT group transition-colors duration-300`}
              >
                <div className="w-8 h-0.5 bg-yellow-DEFAULT group-hover:bg-black mb-6 transition-colors duration-300" />
                <h4 className="font-kanit font-black text-black text-lg uppercase mb-3 transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="font-kanit text-black/60 group-hover:text-black/80 text-sm transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€ (yellow background) */}
      <section className="bg-black py-24 px-6 md:px-10 border-b-2 border-white/10">
        <div className="max-w-screen-xl mx-auto text-center">
          <div className="reveal-on-scroll">
            <h2 className="font-kanit font-black text-white leading-none mb-6">
              READY TO START
              <br />
              <span className="text-white/60">YOUR PROJECT?</span>
            </h2>
            <p className="font-kanit text-white/60 text-base max-w-lg mx-auto mb-10">
              Get in touch for a free consultation and detailed quote. We
              respond within 24 hours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/portal/inquiry?context=Free+Quote"
                className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest px-10 py-5 border-2 border-yellow-DEFAULT shadow-[6px_6px_0_rgba(255,215,0,0.3)] hover:shadow-[2px_2px_0_rgba(255,215,0,0.3)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150"
              >
                Get a Free Quote →
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-white font-kanit font-bold text-sm uppercase tracking-widest border-b-2 border-white/40 pb-1 hover:border-yellow-DEFAULT hover:text-yellow-DEFAULT transition-all duration-200"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
