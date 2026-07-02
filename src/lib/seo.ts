import type { Metadata } from "next";
import { contactEmail, contactPhoneE164 } from "@/src/lib/contact";

export const siteUrl = "https://www.epraisewelding.com";
export const siteName = "E-Praise Welding";

export const defaultDescription =
  "E-Praise Welding is a trusted welding and metal fabrication company in Nigeria. Expert MIG, TIG, structural steel, custom gates, railings, and sculpture design since 2017.";

export const defaultKeywords = [
  "welding Nigeria",
  "metal welding Nigeria",
  "welding services Nigeria",
  "metal fabrication Nigeria",
  "structural steel Nigeria",
  "custom metal fabrication Nigeria",
  "welding company Nigeria",
  "gate fabrication Nigeria",
  "sculpture design Nigeria",
  "E-Praise Welding",
];

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/assets/logo.png`,
      email: contactEmail,
      telephone: contactPhoneE164,
      foundingDate: "2017",
      areaServed: {
        "@type": "Country",
        name: "Nigeria",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#localbusiness`,
      name: siteName,
      url: siteUrl,
      image: `${siteUrl}/assets/logo.png`,
      telephone: contactPhoneE164,
      email: contactEmail,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressCountry: "NG",
      },
      areaServed: {
        "@type": "Country",
        name: "Nigeria",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: defaultDescription,
      inLanguage: "en-NG",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_NG",
      url,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: [
        {
          url: "/assets/logo.png",
          width: 1563,
          height: 1563,
          alt: `${siteName} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${title} | ${siteName}`,
      description,
      images: ["/assets/logo.png"],
    },
  };
}
