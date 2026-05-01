"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CreateTokenGate } from "@/components/create/CreateTokenGate";
import { CreateSessionBar } from "@/components/create/CreateSessionBar";
import { useCreateToken } from "@/components/create/CreateTokenContext";

const NAV = [
  { href: "/create", label: "Overview" },
  { href: "/create/blog", label: "Blog posts" },
  { href: "/create/categories", label: "Blog categories" },
  { href: "/create/faq", label: "FAQ" },
  { href: "/create/guides", label: "Guides" },
  { href: "/create/podcasts", label: "Podcasts" },
] as const;

export function CreateCmsLayout({ children }: { children: ReactNode }) {
  const { token, ready } = useCreateToken();

  if (!ready) {
    return (
      <div className="create-login-screen">
        <p className="create-muted" style={{ margin: 0 }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!token) {
    return <CreateTokenGate />;
  }

  return (
    <div className="create-cms-shell">
      <aside className="create-sidebar" aria-label="CMS navigation">
        <div className="create-sidebar__brand">
          <Link href="/create">CMS</Link>
        </div>
        <nav className="create-sidebar__nav">
          {NAV.map(({ href, label }) => (
            <SidebarLink key={href} href={href} label={label} />
          ))}
        </nav>
        <div className="create-sidebar__footer">
          <Link href="/" className="create-sidebar__muted">
            ← Public site
          </Link>
        </div>
      </aside>
      <div className="create-cms-main">
        <CreateSessionBar />
        <div className="create-cms-main__inner">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/create" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`create-sidebar__link${active ? " is-active" : ""}`}
    >
      {label}
    </Link>
  );
}
