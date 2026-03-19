import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

const defaultSeo = {
  title: "Opolis — Independent work. Collective power.",
  description:
    "Employment infrastructure for independent professionals. Member-owned cooperative: W-2 payroll, group benefits, and compliance — owned collectively, built to last.",
  path: "/",
};

export const metadata: Metadata = buildMetadata(defaultSeo);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgLd = organizationJsonLd();
  const webLd = websiteJsonLd();

  const baseUrl = SITE_URL.replace(/\/$/, "");
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="sitemap"
          type="application/xml"
          href={`${baseUrl}/sitemap.xml`}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Opolis Blog"
          href={`${baseUrl}/blog/feed.xml`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [orgLd, webLd],
            }),
          }}
        />
        <meta name="theme-color" content="#0D0D0D" />
      </head>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#0D0D0D",
        }}
      >
        <Nav />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
