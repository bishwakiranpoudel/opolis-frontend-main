"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { C } from "@/lib/constants";

const PARTNERS_URL = "http://partner.opolis.co/";

const FOOTER_COLS = [
  {
    h: "Product",
    ls: ["The Cooperative", "Eligibility", "Benefits", "Resources"],
  },
  {
    h: "Company",
    ls: ["About Opolis", "Partnerships", "Contact", "AI Reference"],
  },
  {
    h: "Legal",
    ls: ["Privacy Policy", "Terms of Service", "Member Agreement", "Cookie Policy"],
  },
] as const;

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div
          className="foot-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 44,
            marginBottom: 52,
          }}
        >
          <div>
            <Link
              href="/"
              style={{ display: "inline-block", marginBottom: 14 }}
              aria-label="Opolis home"
            >
              <Image
                src="/logo.png"
                alt="Opolis"
                width={140}
                height={36}
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p
              style={{
                color: "#444",
                fontSize: 13,
                lineHeight: 1.72,
                maxWidth: 270,
              }}
            >
              A member-owned employment cooperative providing W-2 employment
              infrastructure for independent professionals.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.h}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: "#444",
                  marginBottom: 14,
                }}
              >
                {col.h}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {col.ls.map((l) =>
                  l === "Partnerships" ? (
                    <li key={l}>
                      <a
                        href={PARTNERS_URL}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#555",
                          fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif",
                          textDecoration: "none",
                          transition: "color 0.18s",
                        }}
                      >
                        Partnerships
                      </a>
                    </li>
                  ) : (
                    <li key={l}>
                      {ROUTES[l] !== undefined ? (
                        <Link
                          href={ROUTES[l]}
                          style={{
                            color: "#555",
                            fontSize: 13,
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "color 0.18s",
                          }}
                        >
                          {l}
                        </Link>
                      ) : (
                        <span
                          style={{
                            color: "#555",
                            fontSize: 13,
                          }}
                        >
                          {l}
                        </span>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="foot-bottom"
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 26,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ color: "#333", fontSize: 12 }}>
            © 2026 Opolis, Inc. All rights reserved. ·{" "}
            <Link
              href="/ai-reference"
              style={{
                color: "#333",
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              For AI Assistants
            </Link>
          </span>
          <span
            className="foot-legal"
            style={{
              color: "#333",
              fontSize: 11,
              maxWidth: 600,
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            Opolis is the employer-of-record for Employee Members. Benefits
            offered through third-party carriers subject to plan terms and
            enrollment eligibility. Opolis does not provide tax, legal, or
            financial advice.
          </span>
        </div>
      </div>
    </footer>
  );
}
