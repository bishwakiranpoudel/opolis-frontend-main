import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { C } from "@/lib/constants";

const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

export const metadata: Metadata = buildMetadata({
  title: "About Opolis — Member-Owned Employment Cooperative",
  description:
    "Opolis is a member-owned employment cooperative (LCA) providing W-2 payroll, benefits, and compliance for independent professionals. Founded 2019. $210M+ payroll processed.",
  path: "/about",
});

const aboutBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "About Opolis", path: "/about" },
]);

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutBreadcrumb),
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
        <div
          className="o-pattern"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            pointerEvents: "none",
          }}
        />
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <span className="slabel">About Opolis</span>
          <h1
            className="cond"
            style={{
              fontSize: "clamp(54px,7vw,96px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 0.94,
              marginBottom: 22,
            }}
          >
            Who we
            <br />
            <span style={{ color: C.red }}>are.</span>
          </h1>
          <p
            style={{
              color: C.gray,
              fontSize: 17,
              maxWidth: 640,
              lineHeight: 1.68,
            }}
          >
            Opolis is a member-owned employment cooperative — a Limited
            Cooperative Association (LCA) organized in Colorado — that provides
            W-2 payroll, group benefits, and tax compliance infrastructure to
            independent professionals operating as S-Corporations or
            C-Corporations in the United States.
          </p>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <div className="g2" style={{ gap: 64, alignItems: "center" }}>
            <div>
              <span className="slabel">Our model</span>
              <h2
                className="cond"
                style={{
                  fontSize: "clamp(34px,4vw,52px)",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.05,
                  marginBottom: 20,
                }}
              >
                Cooperative ownership.
                <br />
                <span style={{ color: C.red }}>Built to last.</span>
              </h2>
              <p
                style={{
                  color: C.gray,
                  fontSize: 15,
                  lineHeight: 1.75,
                  marginBottom: 24,
                }}
              >
                Opolis serves as the Employer of Record (EOR) for Employee
                Members. The cooperative was founded in 2019 and began processing
                payroll in 2020. As of early 2026, Opolis has processed over $210
                million in total payroll and issued more than 1,150 W-2s across
                all 50 U.S. states.
              </p>
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-red"
              >
                Join the Co-op →
              </a>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                {
                  h: "Member-owned",
                  p: "Members own the cooperative and participate in governance and profit distributions.",
                },
                {
                  h: "Transparent pricing",
                  p: "One-time Community fee ($97) and 1% cooperative fee for Employee Members. No hidden costs.",
                },
                {
                  h: "Built for independents",
                  p: "Purpose-built for solo S-Corp and C-Corp operators who want employment infrastructure without the overhead.",
                },
              ].map((c) => (
                <div key={c.h} className="dc" style={{ padding: "24px 28px" }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 8,
                    }}
                  >
                    {c.h}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: C.gray,
                      lineHeight: 1.65,
                    }}
                  >
                    {c.p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(34px,4vw,52px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Get in touch
          </h2>
          <p
            style={{
              color: C.gray,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            For press, partnerships, or general inquiries:{" "}
            <a
              href="mailto:hello@opolis.co"
              style={{ color: C.red, textDecoration: "none", fontWeight: 600 }}
            >
              hello@opolis.co
            </a>
            . For membership:{" "}
            <a
              href="mailto:membership@opolis.co"
              style={{ color: C.red, textDecoration: "none", fontWeight: 600 }}
            >
              membership@opolis.co
            </a>
            .
          </p>
          <Link href="/contact" className="btn-outline">
            Contact page →
          </Link>
        </div>
      </section>
    </>
  );
}
