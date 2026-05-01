import Link from "next/link";
import { BookOpen, FileText, FolderTree, HelpCircle, Mic } from "lucide-react";
import { C } from "@/lib/constants";

const cards = [
  {
    href: "/create/blog",
    title: "Blog",
    desc: "Articles, rich text, categories, and media.",
    Icon: FileText,
  },
  {
    href: "/create/categories",
    title: "Categories",
    desc: "Blog taxonomy for posts.",
    Icon: FolderTree,
  },
  {
    href: "/create/faq",
    title: "FAQ",
    desc: "Resources FAQ sections and answers.",
    Icon: HelpCircle,
  },
  {
    href: "/create/guides",
    title: "Guides",
    desc: "Resource guide blocks and links.",
    Icon: BookOpen,
  },
  {
    href: "/create/podcasts",
    title: "Podcasts",
    desc: "Episodes, series, and show notes.",
    Icon: Mic,
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
          <p className="kicker">Content</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            Dashboard
          </h1>
          <p className="page-hero-lead page-hero-lead--wide section-lead--center">
            Choose a section to edit.
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
