"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { CmsStorageUploadField } from "@/components/create/CmsStorageUploadField";
import { TiptapBlogEditor } from "@/components/create/TiptapBlogEditor";
import { slugifyBlogTitle } from "@/lib/create-content/blog-slug";
import type { BlogPostDoc } from "@/lib/firebase/types";
import { C } from "@/lib/constants";
import { blogPostPath } from "@/lib/blogPosts";

type CategoryRow = { wpId: number; name: string; slug: string };

type PostRow = {
  slug: string;
  title: string;
  dateIso: string;
  categorySlug: string;
};

export function CreateBlogFormClient() {
  return <CreateBlogFormInner />;
}

function CreateBlogFormInner() {
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const { token, ready, refreshIdToken } = useCreateToken();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slugManual, setSlugManual] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryWpId, setCategoryWpId] = useState<number | "">("");
  const [dateIso, setDateIso] = useState("");
  const [featuredUrl, setFeaturedUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [excerptEditorKey, setExcerptEditorKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; path?: string } | null>(
    null
  );

  const slug =
    slugManual.trim() || (title ? slugifyBlogTitle(title) : "");

  const getUploadHeaders = useCallback(async () => {
    const t = await refreshIdToken();
    return createAuthHeaders(t);
  }, [refreshIdToken]);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/create/blog-categories", {
      headers: createAuthHeaders(token),
    });
    const data = (await res.json().catch(() => ({}))) as {
      categories?: CategoryRow[];
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load categories");
      return;
    }
    setCategories(data.categories ?? []);
  }, [token]);

  const loadPosts = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/create/blog", {
      headers: createAuthHeaders(token),
    });
    const data = (await res.json().catch(() => ({}))) as {
      posts?: PostRow[];
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load posts");
      return;
    }
    setPosts(data.posts ?? []);
  }, [token]);

  useEffect(() => {
    if (!ready || !token) return;
    let cancelled = false;
    (async () => {
      setLoadErr(null);
      await loadCategories();
      await loadPosts();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, token, loadCategories, loadPosts]);

  useEffect(() => {
    if (categories.length > 0 && categoryWpId === "") {
      setCategoryWpId(categories[0]!.wpId);
    }
  }, [categories, categoryWpId]);

  function resetNewPostForm() {
    setEditingSlug(null);
    setTitle("");
    setSlugManual("");
    setSlugTouched(false);
    setExcerpt("");
    setBodyHtml("");
    setFeaturedUrl("");
    setDateIso("");
    setEditorKey((k) => k + 1);
    setExcerptEditorKey((k) => k + 1);
    setMsg(null);
  }

  async function beginEdit(postSlug: string) {
    if (!token) return;
    setMsg(null);
    const res = await fetch(
      `/api/create/blog?slug=${encodeURIComponent(postSlug)}`,
      { headers: createAuthHeaders(token) }
    );
    const data = (await res.json().catch(() => ({}))) as {
      post?: BlogPostDoc;
      error?: string;
    };
    if (!res.ok || !data.post) {
      setMsg({ ok: false, text: data.error || "Could not load post" });
      return;
    }
    const p = data.post;
    setEditingSlug(p.slug);
    setTitle(p.title);
    setSlugManual(p.slug);
    setSlugTouched(true);
    const firstCat = p.categoryIds?.[0];
    if (typeof firstCat === "number") setCategoryWpId(firstCat);
    else if (categories[0]) setCategoryWpId(categories[0].wpId);
    setDateIso(p.dateIso || "");
    setFeaturedUrl(p.featuredImageUrl ?? "");
    setExcerpt(p.excerptHtml || "");
    setBodyHtml(p.contentHtml || "");
    setEditorKey((k) => k + 1);
    setExcerptEditorKey((k) => k + 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        editorPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg(null);
    setBusy(true);
    try {
      const payload = {
        title,
        slug: slugManual.trim() || undefined,
        categoryWpId:
          typeof categoryWpId === "number" ? categoryWpId : undefined,
        excerptHtml: excerpt,
        contentHtml: bodyHtml,
        dateIso: dateIso.trim() || undefined,
        featuredImageUrl: featuredUrl.trim() || undefined,
      };

      const isEdit = Boolean(editingSlug);
      const res = await fetch("/api/create/blog", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEdit ? { ...payload, slug: editingSlug } : payload
        ),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        path?: string;
        categorySlug?: string;
        slug?: string;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Save failed" });
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
        text: isEdit ? "Post updated." : "Post published.",
        path,
      });
      await loadPosts();
      if (!isEdit) resetNewPostForm();
    } finally {
      setBusy(false);
    }
  }

  async function removePost(postSlug: string) {
    if (!token) return;
    if (
      !window.confirm(`Delete post "${postSlug}"? This can’t be undone.`)
    ) {
      return;
    }
    const res = await fetch(
      `/api/create/blog?slug=${encodeURIComponent(postSlug)}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(token),
      }
    );
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || "Delete failed" });
      return;
    }
    if (editingSlug === postSlug) resetNewPostForm();
    await loadPosts();
    setMsg({ ok: true, text: "Post deleted." });
  }

  return (
    <>
      {loadErr && (
        <p className="create-form-error" role="alert">
          {loadErr}
        </p>
      )}

      <div className="create-workspace">
        <div
          ref={editorPanelRef}
          id="cms-editor-panel"
          className="create-editor-panel"
        >
          {editingSlug ? (
            <div className="create-editor-panel__banner">
              <span>
                Editing <strong>{editingSlug}</strong>
              </span>
              <button
                type="button"
                className="btn-outline"
                onClick={resetNewPostForm}
              >
                New post
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <h2
                className="cond"
                style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}
              >
                Compose
              </h2>
            </div>
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
              if (!slugTouched && !editingSlug) setSlugManual("");
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
              disabled={Boolean(editingSlug)}
              value={editingSlug ? editingSlug : slugTouched ? slugManual : slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlugManual(e.target.value);
              }}
              placeholder={slugifyBlogTitle(title || "my-post")}
            />
            <p className="create-form-hint">
              {editingSlug
                ? "Slug cannot be changed. Duplicate by creating a new post."
                : `Final: /resources/blog/…/${slug || "…"}`}
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
                  e.target.value ? `${e.target.value}T12:00:00.000Z` : ""
                )
              }
            />
          </div>
          <CmsStorageUploadField
            label="Featured image"
            value={featuredUrl}
            onChange={setFeaturedUrl}
            getUploadHeaders={getUploadHeaders}
            onError={(text) => setMsg({ ok: false, text })}
            accept="image/*"
          />
        </div>

        <div className="create-form-row">
          <span className="slabel">Excerpt</span>
          <TiptapBlogEditor
            key={excerptEditorKey}
            initialHtml={excerpt}
            onChange={setExcerpt}
            getUploadHeaders={getUploadHeaders}
            placeholder="Short summary for listings and SEO…"
            shellClassName="create-editor-shell--compact"
          />
        </div>

        <div className="create-form-row">
          <span className="slabel">Body</span>
          <TiptapBlogEditor
            key={editorKey}
            initialHtml={bodyHtml}
            onChange={setBodyHtml}
            getUploadHeaders={getUploadHeaders}
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
            {busy ? "Saving…" : editingSlug ? "Update post" : "Publish"}
          </button>
        </div>
      </form>
        </div>

        <section className="create-library-panel" aria-labelledby="blog-library-heading">
          <div className="create-library-panel__head">
            <div>
              <h2
                id="blog-library-heading"
                className="cond"
                style={{ fontSize: 20, margin: 0, color: "#fff" }}
              >
                Published posts
              </h2>
            </div>
            <div className="create-library-panel__tools">
              <button type="button" className="btn-outline" onClick={resetNewPostForm}>
                + New post
              </button>
              <button type="button" className="btn-outline" onClick={() => void loadPosts()}>
                Refresh list
              </button>
            </div>
          </div>
          <div className="create-library-scroll">
            <table className="create-cms-table">
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ color: C.gray }}>
                      No posts yet (or still loading).
                    </td>
                  </tr>
                ) : (
                  posts.map((p) => (
                    <tr key={p.slug}>
                      <td>
                        <code>{p.slug}</code>
                      </td>
                      <td>{p.title}</td>
                      <td style={{ color: C.gray }}>{p.dateIso?.slice(0, 10)}</td>
                      <td>
                        <div className="create-cms-actions">
                          <button
                            type="button"
                            className="btn-text"
                            onClick={() => void beginEdit(p.slug)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-text"
                            style={{ color: "#f87171" }}
                            onClick={() => void removePost(p.slug)}
                          >
                            Delete
                          </button>
                          <Link
                            href={blogPostPath({
                              slug: p.slug,
                              categorySlug: p.categorySlug,
                            })}
                            className="btn-text"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
