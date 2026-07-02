import type { Metadata } from "next";
import { createPageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact for Welding Quotes",
  description:
    "Request a free welding or metal fabrication quote in Nigeria. Contact E-Praise Welding by phone or email for gates, railings, structural steel, and custom metalwork.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
