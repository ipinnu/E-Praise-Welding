"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const portalLink = { label: "Portal", href: "/portal" };

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isHomePage = pathname === "/" || pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white border-b-2 border-black shadow-[0_4px_0_#FFD700] py-3"
            : isHomePage
              ? "bg-transparent py-5"
              : "bg-white border-b-2 border-black py-4"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/assets/logo.png"
              alt="EPraise Welding Logo"
              width={60}
              height={60}
            />
            <div className="flex flex-col leading-none">
              <span
                className={`font-kanit font-black text-base uppercase tracking-wider transition-colors duration-300 ${scrolled || !isHomePage ? "text-black" : "text-white"}`}
              >
                E-Praise
              </span>
              <span className="font-kanit font-medium text-xs uppercase tracking-widest text-yellow-DEFAULT">
                Welding
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            ref={navRef}
            className="hidden md:flex items-center gap-1 relative"
          >
            {navLinks?.map((link, i) => {
              const isActive = pathname === link?.href;
              return (
                <Link
                  key={link?.href}
                  href={link?.href}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`relative px-4 py-2 font-kanit font-semibold text-sm uppercase tracking-widest transition-all duration-200 group ${
                    isActive
                      ? scrolled || !isHomePage
                        ? "text-black"
                        : "text-white"
                      : scrolled || !isHomePage
                        ? "text-black/60 hover:text-black"
                        : "text-white/70 hover:text-white"
                  }`}
                >
                  {link?.label}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-yellow-DEFAULT" />
                  )}
                  {/* Hover indicator */}
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-0.5 bg-yellow-DEFAULT/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ${isActive ? "hidden" : ""}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href={portalLink.href}
              className={`hidden md:inline-flex items-center gap-2 font-kanit font-bold text-xs uppercase tracking-widest px-5 py-2.5 border-2 border-black transition-all duration-150 ${
                scrolled || !isHomePage
                  ? "text-black hover:bg-yellow-DEFAULT"
                  : "text-white border-white/60 hover:bg-white/10"
              }`}
            >
              {portalLink.label}
            </Link>
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 bg-black text-yellow-DEFAULT font-kanit font-bold text-xs uppercase tracking-widest px-5 py-2.5 border-2 border-yellow-DEFAULT shadow-[3px_3px_0_rgba(255,215,0,0.5)] hover:shadow-[1px_1px_0_rgba(255,215,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
            >
              Get a Quote
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] focus:outline-none`}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-6 h-[2px] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px] bg-black" : scrolled || !isHomePage ? "bg-black" : "bg-white"}`}
              />
              <span
                className={`block w-6 h-[2px] transition-all duration-300 ${menuOpen ? "opacity-0 bg-black" : scrolled || !isHomePage ? "bg-black" : "bg-white"}`}
              />
              <span
                className={`block w-6 h-[2px] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px] bg-black" : scrolled || !isHomePage ? "bg-black" : "bg-white"}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Yellow stripe accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-DEFAULT" />
        <div className="absolute bottom-0 left-0 w-1 h-full bg-yellow-DEFAULT" />

        <div className="flex flex-col h-full pt-24 px-8 pb-10">
          <nav className="flex flex-col gap-2">
            {navLinks?.map((link, i) => (
              <Link
                key={link?.href}
                href={link?.href}
                onClick={() => setMenuOpen(false)}
                className={`font-kanit font-black text-5xl uppercase tracking-tight transition-all duration-300 border-b-2 border-black/10 pb-3 ${
                  pathname === link?.href
                    ? "text-black"
                    : "text-black/40 hover:text-black"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${i * 50}ms` : "0ms",
                  transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
                }}
              >
                <span className="text-yellow-DEFAULT text-2xl mr-2">
                  0{i + 1}
                </span>
                {link?.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <div className="flex flex-wrap gap-3 mb-4">
              <Link
                href="/portal"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 text-black font-kanit font-bold text-sm uppercase tracking-widest px-6 py-3 border-2 border-black"
              >
                Client Portal
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 bg-yellow-DEFAULT text-black font-kanit font-bold text-sm uppercase tracking-widest px-6 py-3 border-2 border-black shadow-[4px_4px_0_#000]"
              >
                Get a Quote →
              </Link>
            </div>
            <p className="font-kanit text-black/40 text-sm mt-6 uppercase tracking-widest">
              Metal Welding · Fabrication · Sculpture
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
