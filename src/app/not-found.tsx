import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Page Not Found | Opolis",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 32px)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 12,
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "#777", fontSize: 16, marginBottom: 24 }}>
        The page you are looking for could not be found.
      </p>
      <Link
        href="/"
        style={{
          color: "#E8432D",
          fontSize: 16,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Return home
      </Link>
    </div>
  );
}
