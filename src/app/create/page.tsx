import Link from "next/link";
import { BookOpen, FileText, HelpCircle } from "lucide-react";
import { C } from "@/lib/constants";

const cards = [
  {
    href: "/create/blog",
    title: "Blog post",
    desc: "Rich article with category, excerpt, featured image, and TipTap HTML body — stored in blog_posts.",
    Icon: FileText,
  },
  {
    href: "/create/faq",
    title: "FAQ",
    desc: "Add a new FAQ section or append Q&A pairs to an existing section — updates resources_faq/data.",
    Icon: HelpCircle,
  },
  {
    href: "/create/guides",
    title: "Guides",
    desc: "Add a guides category block or append typed links to an existing block — updates resources_guides/data.",
    Icon: BookOpen,
  },
] as const;

export default function CreateHubPage() {
  return (
    <>
      <section
        className="page-hero"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="kicker">Internal CMS</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            Create content
          </h1>
          <p className="page-hero-lead page-hero-lead--wide section-lead--center">
            Publish to Firestore using the same shapes as the live site. Requires{" "}
            <code style={{ color: C.lgray }}>CREATE_CONTENT_SECRET</code> on the
            server and Firebase Admin credentials.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap">
          <div className="create-hub-grid">
            {cards.map(({ href, title, desc, Icon }) => (
              <Link key={href} href={href} className="create-card">
                <Icon
                  size={28}
                  strokeWidth={2}
                  color={C.red}
                  style={{ marginBottom: 14 }}
                  aria-hidden
                />
                <h2 className="create-card__title">{title}</h2>
                <p className="create-card__desc">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
