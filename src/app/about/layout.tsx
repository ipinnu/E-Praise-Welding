import type { Metadata } from "next";
import { createPageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About Our Welding Company",
  description:
    "Learn about E-Praise Welding, a Nigerian metal fabrication company founded in 2017. Expert welding, fabrication, and sculpture design for clients across Nigeria.",
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
