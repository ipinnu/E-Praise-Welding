import React from "react";
import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
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
  title: "E-Praise Welding — Metal Fabrication & Sculpture Design",
  description:
    "E-Praise Welding delivers expert metal welding, custom fabrication, and bespoke sculpture design for contractors, architects, and homeowners across the region.",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={kanit.variable}>
        {children}

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
