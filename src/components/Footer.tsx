import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  contactEmail,
  contactHours,
  contactPhoneDisplay,
  contactPhoneE164,
  whatsappUrl,
} from "@/src/lib/contact";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t-2 border-black">
      {/* Yellow top bar */}
      <div className="h-1.5 bg-yellow-DEFAULT w-full" />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <Image
                src="/assets/logo.png"
                alt="EPraise Welding Logo"
                width={60}
                height={60}
              />
              <div className="flex flex-col leading-none">
                <span className="font-kanit font-black text-base uppercase tracking-wider text-black">
                  E-Praise
                </span>
                <span className="font-kanit font-medium text-xs uppercase tracking-widest text-yellow-DEFAULT">
                  Welding
                </span>
              </div>
            </Link>
            <p className="font-kanit text-black/50 text-sm leading-relaxed max-w-xs">
              Expert metal welding, custom fabrication, and bespoke sculpture
              design in Nigeria. Built to last. Crafted to impress.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-kanit font-black text-xs uppercase tracking-widest text-yellow-DEFAULT mb-5">
              Navigation
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks?.map((link) => (
                <Link
                  key={link?.href}
                  href={link?.href}
                  className="font-kanit font-medium text-sm text-black/60 hover:text-yellow-DEFAULT transition-colors duration-200 uppercase tracking-wider"
                >
                  {link?.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-kanit font-black text-xs uppercase tracking-widest text-yellow-DEFAULT mb-5">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <p className="font-kanit text-sm text-black/60">
                <span className="text-black/30 text-xs uppercase tracking-widest block mb-1">
                  WhatsApp
                </span>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black hover:text-yellow-DEFAULT transition-colors duration-200"
                >
                  {contactPhoneDisplay}
                </a>
              </p>
              <p className="font-kanit text-sm text-black/60">
                <span className="text-black/30 text-xs uppercase tracking-widest block mb-1">
                  Phone
                </span>
                <a
                  href={`tel:${contactPhoneE164}`}
                  className="font-bold text-black hover:text-yellow-DEFAULT transition-colors duration-200"
                >
                  {contactPhoneDisplay}
                </a>
              </p>
              <p className="font-kanit text-sm text-black/60">
                <span className="text-black/30 text-xs uppercase tracking-widest block mb-1">
                  Email
                </span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-bold text-black hover:text-yellow-DEFAULT transition-colors duration-200 break-all"
                >
                  {contactEmail}
                </a>
              </p>
              <p className="font-kanit text-sm text-black/60">
                <span className="text-black/30 text-xs uppercase tracking-widest block mb-1">
                  Hours
                </span>
                {contactHours.weekday}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-kanit text-black/30 text-xs uppercase tracking-widest">
            © 2017-2026 E-Praise Welding. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-DEFAULT rounded-full" />
            <span className="font-kanit text-black/30 text-xs uppercase tracking-widest">
              Metal Welding · Fabrication · Sculpture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
