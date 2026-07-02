import React from "react";
import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import {
  defaultDescription,
  defaultKeywords,
  organizationJsonLd,
  siteName,
  siteUrl,
} from "@/src/lib/seo";
import WhatsAppButton from "@/src/components/WhatsAppButton";
import "../styles/tailwind.css";

const kanit = Kanit({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kanit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "E-Praise Welding | Welding & Metal Fabrication in Nigeria",
    template: "%s | E-Praise Welding Nigeria",
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "96x96", type: "image/x-icon" },
    ],
    apple: [{ url: "/icon-192.png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName,
    title: "E-Praise Welding | Welding & Metal Fabrication in Nigeria",
    description: defaultDescription,
    images: [
      {
        url: "/assets/logo.png",
        width: 1563,
        height: 1563,
        alt: "E-Praise Welding logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "E-Praise Welding | Welding & Metal Fabrication in Nigeria",
    description: defaultDescription,
    images: ["/assets/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body className={kanit.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}

        <WhatsAppButton />

        <script
          type="module"
          defer
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fepraisewel5750back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.17"
        />
        <script
          type="module"
          defer
          src="https://static.rocket.new/rocket-shot.js?v=0.0.2"
        />
      </body>
    </html>
  );
}
