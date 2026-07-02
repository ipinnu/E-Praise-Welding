import type { Metadata } from "next";
import { createPageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Welding & Fabrication Project Gallery",
  description:
    "Browse completed welding and metal fabrication projects in Nigeria, including custom gates, railings, sculptures, and structural steel work.",
  path: "/gallery",
});

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
