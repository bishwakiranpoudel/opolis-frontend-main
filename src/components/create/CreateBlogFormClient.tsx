"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CreateSessionBar } from "@/components/create/CreateSessionBar";
import { CreateTokenGate } from "@/components/create/CreateTokenGate";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { TiptapBlogEditor } from "@/components/create/TiptapBlogEditor";
import { slugifyBlogTitle } from "@/lib/create-content/blog-slug";
import { C } from "@/lib/constants";
import { blogPostPath } from "@/lib/blogPosts";

type CategoryRow = { wpId: number; name: string; slug: string };

export function CreateBlogFormClient() {
  return (
    <CreateTokenGate>
      <CreateBlogFormInner />
    </CreateTokenGate>
  );
}

function CreateBlogFormInner() {
  const { token, ready } = useCreateToken();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slugManual, setSlugManual] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryWpId, setCategoryWpId] = useState<number | "">("");
  const [dateIso, setDateIso] = useState("");
  const [featuredUrl, setFeaturedUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; path?: string } | null>(
    null
  );

  const slug =
    slugManual.trim() || (title ? slugifyBlogTitle(title) : "");

  useEffect(() => {
    if (!ready || !token) return;
    let cancelled = false;
    (async () => {
      setLoadErr(null);
      const res = await fetch("/api/create/blog-categories", {
        headers: createAuthHeaders(token),
      });
      const data = (await res.json().catch(() => ({}))) as {
        categories?: CategoryRow[];
        error?: string;
      };
      if (cancelled) return;
      if (!res.ok) {
        setLoadErr(data.error || "Could not load categories");
        return;
      }
      setCategories(data.categories ?? []);
      if ((data.categories?.length ?? 0) > 0 && categoryWpId === "") {
        setCategoryWpId(data.categories![0]!.wpId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, token]); // eslint-disable-line react-hooks/exhaustive-deps -- default category when categories first load

  const getToken = useCallback(() => token, [token]);

  const uploadFeatured = useCallback(
    async (file: File) => {
      if (!token) return;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/create/upload", {
        method: "POST",
        headers: createAuthHeaders(token),
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Featured image upload failed" });
        return;
      }
      if (data.url) setFeaturedUrl(data.url);
    },
    [token]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/create/blog", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: slugManual.trim() || undefined,
          categoryWpId:
            typeof categoryWpId === "number" ? categoryWpId : undefined,
          excerptHtml: excerpt,
          contentHtml: bodyHtml,
          dateIso: dateIso.trim() || undefined,
          featuredImageUrl: featuredUrl.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        path?: string;
        categorySlug?: string;
        slug?: string;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Publish failed" });
        return;
      }
      const path =
        data.path ||
        (data.slug && data.categorySlug
          ? blogPostPath({
              slug: data.slug,
              categorySlug: data.categorySlug,
            })
          : "");
      setMsg({
        ok: true,
        text: "Post published to Firestore.",
        path,
      });
      setTitle("");
      setSlugManual("");
      setSlugTouched(false);
      setExcerpt("");
      setBodyHtml("");
      setFeaturedUrl("");
      setDateIso("");
      setEditorKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <CreateSessionBar />
      {loadErr && (
        <p className="create-form-error" role="alert">
          {loadErr}
        </p>
      )}
      <form className="create-form" onSubmit={onSubmit}>
        <div className="create-form-row">
          <label className="slabel" htmlFor="blog-title">
            Title
          </label>
          <input
            id="blog-title"
            className="create-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlugManual("");
            }}
            required
            placeholder="Article headline"
          />
        </div>

        <div className="create-form-row--split">
          <div className="create-form-row">
            <label className="slabel" htmlFor="blog-slug">
              URL slug
            </label>
            <input
              id="blog-slug"
              className="create-input"
              value={slugTouched ? slugManual : slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlugManual(e.target.value);
              }}
              placeholder={slugifyBlogTitle(title || "my-post")}
            />
            <p className="create-form-hint">
              Leave synced to title, or edit for a custom path. Final:{" "}
              <code style={{ color: C.lgray }}>/resources/blog/…/{slug || "…"}</code>
            </p>
          </div>
          <div className="create-form-row">
            <label className="slabel" htmlFor="blog-cat">
              Category
            </label>
            <select
              id="blog-cat"
              className="create-select"
              required
              value={categoryWpId === "" ? "" : String(categoryWpId)}
              onChange={(e) =>
                setCategoryWpId(
                  e.target.value ? parseInt(e.target.value, 10) : ""
                )
              }
            >
              {categories.length === 0 ? (
                <option value="">Load categories…</option>
              ) : (
                categories.map((c) => (
                  <option key={c.wpId} value={c.wpId}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="create-form-row--split">
          <div className="create-form-row">
            <label className="slabel" htmlFor="blog-date">
              Publish date (optional)
            </label>
            <input
              id="blog-date"
              className="create-input"
              type="date"
              value={dateIso.slice(0, 10)}
              onChange={(e) =>
                setDateIso(
                  e.target.value
                    ? `${e.target.value}T12:00:00.000Z`
                    : ""
                )
              }
            />
          </div>
          <div className="create-form-row">
            <label className="slabel" htmlFor="blog-featured">
              Featured image URL
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                id="blog-featured"
                className="create-input"
                style={{ flex: 1, minWidth: 200 }}
                value={featuredUrl}
                onChange={(e) => setFeaturedUrl(e.target.value)}
                placeholder="https://…"
              />
              <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="create-file-hidden"
                  aria-hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void uploadFeatured(f);
                  }}
                />
              </label>
            </div>
            <p className="create-form-hint">
              Shown above the article body on the public post page.
            </p>
          </div>
        </div>

        <div className="create-form-row">
          <label className="slabel" htmlFor="blog-excerpt">
            Excerpt (HTML)
          </label>
          <textarea
            id="blog-excerpt"
            className="create-textarea"
            style={{ minHeight: 88 }}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            placeholder="<p>Short summary for listings and SEO.</p>"
          />
        </div>

        <div className="create-form-row">
          <span className="slabel">Body</span>
          <TiptapBlogEditor
            key={editorKey}
            initialHtml={bodyHtml}
            onChange={setBodyHtml}
            getToken={getToken}
          />
        </div>

        {msg && (
          <p
            className={msg.ok ? "create-form-success" : "create-form-error"}
            role="status"
          >
            {msg.text}{" "}
            {msg.ok && msg.path && (
              <Link href={msg.path} style={{ color: C.red }}>
                View post →
              </Link>
            )}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" className="btn btn-red" disabled={busy}>
            {busy ? "Publishing…" : "Publish to Firestore"}
          </button>
          <Link href="/create" className="btn-outline">
            Back
          </Link>
        </div>
      </form>
    </>
  );
}
