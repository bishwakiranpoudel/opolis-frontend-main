"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_PAGES, ROUTES } from "@/lib/constants";

const COMMONS_LOGIN = "https://commons.opolis.co/";
const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

function NavMobileControls({ pathname }: { pathname: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  const isActive = (label: string) => {
    const path = ROUTES[label];
    if (!path) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <button
        type="button"
        className="nav-burger"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="nav-mobile-menu"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <span className="nav-burger-bar" aria-hidden />
        <span className="nav-burger-bar" aria-hidden />
        <span className="nav-burger-bar" aria-hidden />
      </button>

      <div
        id="nav-mobile-menu"
        className={`nav-overlay ${mobileOpen ? "nav-overlay-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="nav-overlay-backdrop"
          onClick={closeMenu}
          aria-hidden
        />
        <div className="nav-overlay-panel">
          <div className="nav-overlay-panel-inner">
            <button
              type="button"
              className="nav-overlay-close"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <span className="nav-overlay-close-x" aria-hidden>
                ×
              </span>
            </button>
            <nav className="nav-overlay-nav" aria-label="Mobile navigation">
              {NAV_PAGES.map((p) => (
                <Link
                  key={p}
                  href={ROUTES[p] ?? "/"}
                  className={`nav-overlay-link${isActive(p) ? " nav-overlay-link-active" : ""}`}
                  onClick={closeMenu}
                >
                  {p}
                </Link>
              ))}
            </nav>
            <div className="nav-overlay-actions">
              <a
                href={COMMONS_LOGIN}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-overlay-link"
                onClick={closeMenu}
              >
                Log in
              </a>
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wht nav-overlay-cta"
                onClick={closeMenu}
              >
                Join the Co-op →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      const ratio = height > 0 ? (scrollTop / height) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, ratio)));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const isActive = (label: string) => {
    const path = ROUTES[label];
    if (!path) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="nav-shell" role="banner">
        <div
          className="nav-progress-track"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        >
          <div
            className="nav-progress-fill"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo" aria-label="Opolis home">
              <Image
                src="/logo.png"
                alt="Opolis"
                width={120}
                height={32}
                style={{
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
                priority
              />
            </Link>

            <div className="nav-links">
              {NAV_PAGES.map((p) => (
                <Link
                  key={p}
                  href={ROUTES[p] ?? "/"}
                  className={`nlink${isActive(p) ? " on" : ""}`}
                >
                  {p}
                </Link>
              ))}
            </div>
            <div className="nav-actions">
              <a
                href={COMMONS_LOGIN}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-nav"
              >
                Log in
              </a>
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wht nav-join"
              >
                Join the Co-op →
              </a>
            </div>

            <NavMobileControls key={pathname} pathname={pathname} />
          </div>
        </div>
      </header>
    </>
  );
}
