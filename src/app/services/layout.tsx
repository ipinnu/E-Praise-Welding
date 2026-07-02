import type { Metadata } from "next";
import { createPageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Welding & Metal Fabrication Services",
  description:
    "Professional welding services in Nigeria including MIG, TIG, structural steel, custom gates, railings, ornamental iron, and sculpture design.",
  path: "/services",
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
