import type { Metadata } from "next";
import "./globals.css";

function siteOrigin() {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.origin;
    } catch {
      // Fall through to the safe development fallback below.
    }
  }
  return "http://localhost:3000";
}

export function generateMetadata(): Metadata {
  const origin = siteOrigin();
  const title = "The Contorno Corporation";
  const description = "Private investigations, criminal defense case analysis, bail bonds, and community association management.";
  return {
    metadataBase: new URL(origin),
    title: { default: title, template: "%s | The Contorno Corporation" },
    description,
    icons: { icon: "/favicon.svg" },
    openGraph: { title, description, type: "website", images: [{ url: `${origin}/og.png`, width: 1733, height: 909, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
