"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { C } from "@/lib/constants";

type CategoryRow = { wpId: number; name: string; slug: string };

export function CreateCategoriesCrudClient() {
  const { token, ready } = useCreateToken();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadErr(null);
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

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/blog-categories", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim().toLowerCase() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Create failed" });
        return;
      }
      setMsg({ ok: true, text: "Category created." });
      setName("");
      setSlug("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(wpId: number) {
    if (!token) return;
    if (!window.confirm("Delete this category? Posts that use it may break.")) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/create/blog-categories?wpId=${encodeURIComponent(String(wpId))}`,
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
      setMsg({ ok: true, text: "Category deleted." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {loadErr && (
        <p className="create-form-error" role="alert">
          {loadErr}
        </p>
      )}

      <div className="create-workspace">
        <div className="create-editor-panel" id="cms-editor-panel">
          <h2
            className="cond"
            style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}
          >
            Add category
          </h2>
          <p className="create-muted" style={{ margin: "0 0 18px" }}>
            Add a name and URL slug. Existing categories are listed on the right.
          </p>
          <form className="create-form" onSubmit={onCreate}>
        <div className="create-form-row--split">
          <div className="create-form-row">
            <label className="slabel" htmlFor="cat-name">
              Display name
            </label>
            <input
              id="cat-name"
              className="create-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Payroll"
            />
          </div>
          <div className="create-form-row">
            <label className="slabel" htmlFor="cat-slug">
              URL slug
            </label>
            <input
              id="cat-slug"
              className="create-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="payroll"
            />
          </div>
        </div>
        {msg && (
          <p
            className={msg.ok ? "create-form-success" : "create-form-error"}
            role="status"
          >
            {msg.text}
          </p>
        )}
        <button type="submit" className="btn btn-red" disabled={busy}>
          {busy ? "Saving…" : "Create category"}
        </button>
      </form>
        </div>

        <section className="create-library-panel" aria-labelledby="cat-library-heading">
          <div className="create-library-panel__head">
            <div>
              <h2
                id="cat-library-heading"
                className="cond"
                style={{ fontSize: 20, margin: 0, color: "#fff" }}
              >
                All categories
              </h2>
            </div>
            <div className="create-library-panel__tools">
              <button type="button" className="btn-outline" onClick={() => void load()}>
                Refresh
              </button>
            </div>
          </div>
          <div className="create-library-scroll">
            <table className="create-cms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ color: C.gray }}>
                      No categories (or loading).
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.wpId}>
                      <td>{c.wpId}</td>
                      <td>{c.name}</td>
                      <td>
                        <code>{c.slug}</code>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-text"
                          style={{ color: "#f87171" }}
                          disabled={busy}
                          onClick={() => void remove(c.wpId)}
                        >
                          Delete
                        </button>
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
