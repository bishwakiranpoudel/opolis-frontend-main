import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, contactPageJsonLd } from "@/lib/seo";
import { C, SITE_URL } from "@/lib/constants";
import { Mail, Handshake, Headphones, MessagesSquare } from "lucide-react";

const PRESS_KIT_URL =
  "https://drive.google.com/drive/folders/14i7BEhfGyNL0uZPzpMxJ-KA3Xw9o6Xj7?usp=drive_link";

export const metadata: Metadata = buildMetadata({
  title: "Contact Opolis — Membership, Press & Partnerships",
  description:
    "Get in touch with Opolis. General: hello@opolis.co. Membership: membership@opolis.co. Support: support@opolis.co. Press kit and contact details.",
  path: "/contact",
});

const contactBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

const contactStructuredLd = contactPageJsonLd({
  name: "Contact Opolis — Membership, Press & Partnerships",
  description:
    "Get in touch with Opolis. General: hello@opolis.co. Membership: membership@opolis.co. Support: support@opolis.co. Press kit and contact details.",
  url: `${SITE_URL}/contact`,
  speakableCssSelectors: [".speakable"],
});

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactBreadcrumb),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactStructuredLd),
        }}
      />
      <section
        className="page-hero"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 720 }}>
            <span className="slabel">Get in Touch</span>
            <h1 className="cond">Contact.</h1>
            <p className="page-hero-lead page-hero-lead--contact speakable">
            We&apos;re a small, lean team. The right email gets you to the right
            person faster.
          </p>
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              className="dc"
              style={{
                padding: "36px 40px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,.06)",
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: C.red,
                  }}
                  aria-hidden
                >
                  <Mail size={20} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: C.gray,
                      marginBottom: 8,
                    }}
                  >
                    General
                  </div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    Press, Partnerships & Everything Else
                  </h2>
                  <p
                    style={{
                      color: C.lgray,
                      fontSize: 14,
                      lineHeight: 1.78,
                      marginBottom: 20,
                    }}
                  >
                    Media inquiries, partnership opportunities, and anything
                    that doesn&apos;t fit the boxes below.
                  </p>
                  <a
                    href="mailto:hello@opolis.co"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(255,255,255,.05)",
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "12px 20px",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                      }}
                    >
                      hello@opolis.co
                    </span>
                    <span style={{ color: C.gray, fontSize: 14 }}>→</span>
                  </a>
                  <div style={{ marginTop: 14 }}>
                    <a
                      href={PRESS_KIT_URL}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        color: C.red,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "color 0.15s",
                      }}
                    >
                      <span>↗</span>
                      <span>
                        Download the Opolis press kit (logos, brand assets,
                        boilerplate)
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="dc"
              style={{
                padding: "36px 40px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,.06)",
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: C.red,
                  }}
                  aria-hidden
                >
                  <Handshake size={20} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: C.gray,
                      marginBottom: 8,
                    }}
                  >
                    Membership
                  </div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    Joining Opolis
                  </h2>
                  <p
                    style={{
                      color: C.lgray,
                      fontSize: 14,
                      lineHeight: 1.78,
                      marginBottom: 20,
                    }}
                  >
                    Pre-application questions, eligibility, onboarding, or
                    anything related to becoming a Member.
                  </p>
                  <a
                    href="mailto:membership@opolis.co"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(255,255,255,.05)",
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "12px 20px",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                      }}
                    >
                      membership@opolis.co
                    </span>
                    <span style={{ color: C.gray, fontSize: 14 }}>→</span>
                  </a>
                </div>
              </div>
            </div>

            <div
              className="dc"
              style={{
                padding: "36px 40px",
                border: "1px solid rgba(232,67,45,.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(232,67,45,.12)",
                    border: "1px solid rgba(232,67,45,.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: C.red,
                  }}
                  aria-hidden
                >
                  <Headphones size={20} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: C.red,
                      marginBottom: 8,
                    }}
                  >
                    Active Members
                  </div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    Membership &amp; Dashboard Support
                  </h2>
                  <p
                    style={{
                      color: C.lgray,
                      fontSize: 14,
                      lineHeight: 1.78,
                      marginBottom: 20,
                    }}
                  >
                    If you&apos;re a current Opolis Employee Member or Community
                    Member and have questions about your membership or issues
                    with your dashboard, reach out here.
                  </p>
                  <a
                    href="mailto:support@opolis.co"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(232,67,45,.1)",
                      border: "1px solid rgba(232,67,45,.3)",
                      borderRadius: 8,
                      padding: "12px 20px",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                      }}
                    >
                      support@opolis.co
                    </span>
                    <span style={{ color: C.red, fontSize: 14 }}>→</span>
                  </a>
                </div>
              </div>
            </div>

            <div
              className="dc"
              style={{
                padding: "36px 40px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(88,101,242,.12)",
                    border: "1px solid rgba(88,101,242,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#818cf8",
                  }}
                  aria-hidden
                >
                  <MessagesSquare size={20} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#818cf8",
                      marginBottom: 8,
                    }}
                  >
                    Community
                  </div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    Join the Conversation on Discord
                  </h2>
                  <p
                    style={{
                      color: C.lgray,
                      fontSize: 14,
                      lineHeight: 1.78,
                      marginBottom: 20,
                    }}
                  >
                    Got a general question? Want to connect with other Members or
                    hear how others are using Opolis? The Discord is the place
                    for community discussion, peer answers, and staying plugged
                    in. Not a support line — just a good room to be in.
                  </p>
                  <a
                    href="https://discord.gg/7qWZ9PEB"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(88,101,242,.1)",
                      border: "1px solid rgba(88,101,242,.3)",
                      borderRadius: 8,
                      padding: "12px 20px",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                      }}
                    >
                      Join the Opolis Discord →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              color: C.gray,
              fontSize: 13,
              lineHeight: 1.7,
              marginTop: 32,
              paddingTop: 24,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            Opolis is a lean cooperative — we don&apos;t have a phone support
            line. Email is the fastest path to the right person.
          </p>
        </div>
      </section>
    </>
  );
}
