"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import Image from "next/image";
import Link from "next/link";

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

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

const services = [
  "Metal Welding",
  "Custom Fabrication",
  "Sculpture Design",
  "Structural Steel",
  "Ornamental Iron",
  "Maintenance & Repair",
  "Other",
];

function ContactForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ref ? `I'm interested in something like "${ref}". ` : "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="lg:col-span-3 reveal-on-scroll delay-2">
      {/* Gallery referral banner */}
      {ref && !submitted && (
        <div className="mb-8 border-2 border-black bg-yellow-DEFAULT p-4 flex items-start gap-3">
          <span className="font-kanit font-black text-black text-xl leading-none mt-0.5">✦</span>
          <div>
            <p className="font-kanit font-black text-black text-sm uppercase tracking-wide mb-1">
              Inspired by: {ref}
            </p>
            <p className="font-kanit text-black/70 text-xs">
              Your message has been pre-filled. Want faster responses?{" "}
              <Link href="/portal/login" className="underline font-bold">
                Create a free account
              </Link>{" "}
              to chat directly with us.
            </p>
          </div>
        </div>
      )}

      {submitted ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="w-20 h-20 bg-yellow-DEFAULT border-2 border-black flex items-center justify-center mb-6">
            <span className="font-kanit font-black text-black text-3xl">
              ✓
            </span>
          </div>
          <h3 className="font-kanit font-black text-black text-3xl uppercase mb-4">
            Message Sent!
          </h3>
          <p className="font-kanit text-black/60 text-base max-w-sm">
            Thank you for reaching out. We will review your request and
            get back to you within 24 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                service: "",
                message: "",
              });
            }}
            className="mt-8 font-kanit font-bold text-sm uppercase tracking-widest text-black border-b-2 border-yellow-DEFAULT pb-1 hover:gap-2 transition-all duration-200"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="form-field">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                placeholder="Your Name"
                required
                className="form-input"
              />
            </div>
            <div className="form-field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="Email Address"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="form-field">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                placeholder="Phone Number"
                className="form-input"
              />
            </div>
            <div className="form-field">
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                onFocus={() => setFocused("service")}
                onBlur={() => setFocused(null)}
                required
                className="form-input"
              >
                <option value="" disabled>
                  Select a Service
                </option>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              placeholder="Tell us about your project..."
              required
              rows={5}
              className="form-input resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <p className="font-kanit text-black/40 text-xs uppercase tracking-widest">
              Free consultation · No obligation
            </p>
            <button
              type="submit"
              className="submit-btn inline-flex items-center gap-3 bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest px-10 py-5 border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150"
            >
              Send Message
              <span className="text-xl">→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
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

        .form-field {
          position: relative;
        }
        .form-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #000;
          padding: 12px 0;
          font-family: 'Kanit', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: #000;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .form-input:focus {
          border-color: #FFD700;
        }
        .form-input::placeholder {
          color: rgba(0,0,0,0.3);
          font-family: 'Kanit', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.8rem;
        }
        .form-input option {
          background: white;
          color: black;
        }
        .form-label {
          position: absolute;
          top: 12px;
          left: 0;
          font-family: 'Kanit', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(0,0,0,0.4);
          transition: all 0.2s ease;
          pointer-events: none;
        }
        .form-input:focus ~ .form-label,
        .form-input:not(:placeholder-shown) ~ .form-label {
          top: -16px;
          font-size: 0.65rem;
          color: #FFD700;
        }

        .hero-line {
          width: 0;
          animation: expandLine 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        @keyframes expandLine {
          to { width: 100%; }
        }

        .submit-btn {
          position: relative;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.4s ease;
        }
        .submit-btn:hover::after {
          left: 100%;
        }

        .contact-info-item {
          transition: all 0.2s ease;
        }
        .contact-info-item:hover {
          transform: translateX(4px);
        }
      `}</style>

      <Header />

      {/* PAGE HERO */}
      <section className="bg-black pt-32 pb-20 px-6 md:px-10 relative overflow-hidden border-b-2 border-white/10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #fff, #fff 2px, transparent 2px, transparent 40px)",
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
              Get In Touch
            </span>
          </div>

          <h1
            className="font-kanit font-black text-white leading-none mb-6"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            CONTACT
            <br />
            <span className="text-white/60">US</span>
          </h1>

          <div className="hero-line h-0.5 bg-white/20 mb-8" />

          <p
            className="font-kanit text-white/70 text-lg max-w-2xl"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both",
            }}
          >
            Ready to start your project? Get in touch for a free consultation
            and detailed quote. We respond within 24 hours.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="bg-white py-24 px-6 md:px-10">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-2 reveal-on-scroll">
            <span className="font-kanit font-semibold text-xs uppercase tracking-widest text-black/40 block mb-8">
              Reach Us
            </span>

            <div className="space-y-8">
              {[
                {
                  label: "Phone",
                  value: "0905 449 2490",
                  sub: "Mon–Fri, 7AM–6PM",
                },
                {
                  label: "Email",
                  value: "info@epraisewelding.com",
                  sub: "We reply within 24 hours",
                },
                {
                  label: "Hours",
                  value: "Mon–Fri: 7AM – 6PM",
                  sub: "Sat: 8AM – 2PM · Sun: Closed",
                },
              ].map((info, i) => (
                <div key={i} className="contact-info-item">
                  <span className="font-kanit font-black text-xs uppercase tracking-widest text-yellow-DEFAULT block mb-1">
                    {info.label}
                  </span>
                  <p className="font-kanit font-bold text-black text-lg">
                    {info.value}
                  </p>
                  <p className="font-kanit text-black/40 text-sm">{info.sub}</p>
                </div>
              ))}
            </div>

            {/* Emergency block */}
            <div className="mt-12 bg-black border-2 border-black p-6">
              <h4 className="font-kanit font-black text-white text-lg uppercase mb-2">
                Emergency Repairs?
              </h4>
              <p className="font-kanit text-white/70 text-sm mb-4">
                We offer emergency welding and repair services for urgent
                situations.
              </p>
              <span className="font-kanit font-black text-yellow-DEFAULT text-xl">
                0905 449 2490
              </span>
            </div>
          </div>

          {/* Contact Form — wrapped in Suspense for useSearchParams */}
          <Suspense fallback={<div className="lg:col-span-3" />}>
            <ContactForm />
          </Suspense>
        </div>
      </section>

      {/* MAP PLACEHOLDER */}
      <section className="bg-black border-t-2 border-white/10">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 40px)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center mb-4">
              <Image
                src="/assets/logo.png"
                alt="EPraise Welding Logo"
                width={60}
                height={60}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
