"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { C } from "@/lib/constants";
import type { GuidesSection } from "@/lib/resourcesData";

const TYPE_OPTIONS = ["Guide", "Article", "Video", "Graphic"] as const;

export function CreateGuidesFormClient() {
  return <CreateGuidesFormInner />;
}

function CreateGuidesFormInner() {
  const { token, ready } = useCreateToken();
  const [guides, setGuides] = useState<GuidesSection[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"append_section" | "append_items">(
    "append_section"
  );

  const [cat, setCat] = useState("");
  const [cc, setCc] = useState("#E8432D");
  const [rows, setRows] = useState<
    { type: string; label: string; url: string }[]
  >([{ type: "Guide", label: "", url: "" }]);

  const [sectionIndex, setSectionIndex] = useState(0);
  const [appendRows, setAppendRows] = useState<
    { type: string; label: string; url: string }[]
  >([{ type: "Guide", label: "", url: "" }]);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadErr(null);
    const res = await fetch("/api/create/resources", {
      headers: createAuthHeaders(token),
    });
    const data = (await res.json().catch(() => ({}))) as {
      guides?: GuidesSection[];
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load guides");
      return;
    }
    const list = data.guides ?? [];
    setGuides(list);
    setSectionIndex((i) => (list.length ? Math.min(i, list.length - 1) : 0));
  }, [token]);

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, load]);

  useEffect(() => {
    if (guides.length === 0 && mode === "append_items") {
      setMode("append_section");
    }
  }, [guides.length, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "append_section") {
        const items = rows
          .map((r) => ({
            type: r.type.trim(),
            label: r.label.trim(),
            url: r.url.trim(),
          }))
          .filter((r) => r.type && r.label && r.url);
        const res = await fetch("/api/create/guides", {
          method: "POST",
          headers: {
            ...createAuthHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "append_section",
            section: {
              cat: cat.trim(),
              cc: cc.trim(),
              items,
            },
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok) {
          setMsg({ ok: false, text: data.error || "Save failed" });
          return;
        }
        setMsg({ ok: true, text: "New guides section saved." });
        setCat("");
        setCc("#E8432D");
        setRows([{ type: "Guide", label: "", url: "" }]);
      } else {
        const items = appendRows
          .map((r) => ({
            type: r.type.trim(),
            label: r.label.trim(),
            url: r.url.trim(),
          }))
          .filter((r) => r.type && r.label && r.url);
        const res = await fetch("/api/create/guides", {
          method: "POST",
          headers: {
            ...createAuthHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "append_items",
            sectionIndex,
            items,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok) {
          setMsg({ ok: false, text: data.error || "Save failed" });
          return;
        }
        setMsg({ ok: true, text: "Rows appended to section." });
        setAppendRows([{ type: "Guide", label: "", url: "" }]);
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeSection(sectionIndex: number) {
    if (!token) return;
    if (!window.confirm(`Delete guides block #${sectionIndex + 1}?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/guides", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "delete_section", sectionIndex }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Delete failed" });
        return;
      }
      setMsg({ ok: true, text: "Block removed." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(sectionIndex: number, itemIndex: number) {
    if (!token) return;
    if (!window.confirm("Remove this link row?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/guides", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "delete_item", sectionIndex, itemIndex }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Delete failed" });
        return;
      }
      setMsg({ ok: true, text: "Row removed." });
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
          <h2 className="cond" style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}>
            Add guides content
          </h2>
          <p className="create-muted" style={{ margin: "0 0 18px" }}>
            Add a category block or append rows to an existing block. Live content appears on the right.
          </p>

      <div className="create-form-row" style={{ marginBottom: 20 }}>
        <span className="slabel">Mode</span>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: C.lgray,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="guides-mode"
              checked={mode === "append_section"}
              onChange={() => setMode("append_section")}
            />
            New category block
          </label>
          {guides.length > 0 ? (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: C.lgray,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="guides-mode"
                checked={mode === "append_items"}
                onChange={() => setMode("append_items")}
              />
              Add rows to existing block
            </label>
          ) : null}
        </div>
      </div>

      <form className="create-form" onSubmit={onSubmit}>
        {mode === "append_section" ? (
          <>
            <div className="create-form-row--split">
              <div className="create-form-row">
                <label className="slabel" htmlFor="g-cat">
                  Category title
                </label>
                <input
                  id="g-cat"
                  className="create-input"
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  required
                  placeholder="e.g. Payroll"
                />
              </div>
              <div className="create-form-row">
                <label className="slabel" htmlFor="g-cc">
                  Accent color
                </label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    id="g-cc"
                    type="color"
                    value={cc.length === 7 ? cc : "#E8432D"}
                    onChange={(e) => setCc(e.target.value)}
                    style={{
                      width: 48,
                      height: 40,
                      padding: 0,
                      border: "1px solid #252525",
                      borderRadius: 8,
                      background: "#111",
                    }}
                  />
                  <input
                    className="create-input"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="#E8432D"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
            <span className="slabel">Rows</span>
            <div className="create-guide-items">
              {rows.map((row, i) => (
                <div key={i} className="create-repeat-block">
                  <div className="create-repeat-block__head">
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>
                      #{i + 1}
                    </span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() =>
                          setRows((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="create-form-row--split">
                    <div className="create-form-row">
                      <label className="slabel">Type</label>
                      <select
                        className="create-select"
                        value={row.type}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, type: e.target.value } : r
                            )
                          )
                        }
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="create-form-row">
                      <label className="slabel">Label</label>
                      <input
                        className="create-input"
                        value={row.label}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, label: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Link title"
                      />
                    </div>
                  </div>
                  <div className="create-form-row">
                    <label className="slabel">URL</label>
                    <input
                      className="create-input"
                      value={row.url}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, url: e.target.value } : r
                          )
                        )
                      }
                      placeholder="https://… or /resources/blog/…"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                setRows((prev) => [...prev, { type: "Guide", label: "", url: "" }])
              }
            >
              + Add row
            </button>
          </>
        ) : (
          <>
            <div className="create-form-row">
              <label className="slabel" htmlFor="g-idx">
                Target block
              </label>
              <select
                id="g-idx"
                className="create-select"
                value={String(sectionIndex)}
                onChange={(e) => setSectionIndex(parseInt(e.target.value, 10))}
              >
                {guides.map((g, i) => (
                  <option key={`${g.cat}-${i}`} value={i}>
                    [{i}] {g.cat}
                  </option>
                ))}
              </select>
            </div>
            <span className="slabel">New rows</span>
            <div className="create-guide-items">
              {appendRows.map((row, i) => (
                <div key={i} className="create-repeat-block">
                  <div className="create-repeat-block__head">
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>
                      #{i + 1}
                    </span>
                    {appendRows.length > 1 && (
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() =>
                          setAppendRows((prev) =>
                            prev.filter((_, j) => j !== i)
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="create-form-row--split">
                    <div className="create-form-row">
                      <label className="slabel">Type</label>
                      <select
                        className="create-select"
                        value={row.type}
                        onChange={(e) =>
                          setAppendRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, type: e.target.value } : r
                            )
                          )
                        }
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="create-form-row">
                      <label className="slabel">Label</label>
                      <input
                        className="create-input"
                        value={row.label}
                        onChange={(e) =>
                          setAppendRows((prev) =>
                            prev.map((r, j) =>
                              j === i ? { ...r, label: e.target.value } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="create-form-row">
                    <label className="slabel">URL</label>
                    <input
                      className="create-input"
                      value={row.url}
                      onChange={(e) =>
                        setAppendRows((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, url: e.target.value } : r
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                setAppendRows((prev) => [
                  ...prev,
                  { type: "Guide", label: "", url: "" },
                ])
              }
            >
              + Add row
            </button>
          </>
        )}

        {msg && (
          <p
            className={msg.ok ? "create-form-success" : "create-form-error"}
            role="status"
          >
            {msg.text}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" className="btn btn-red" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => void load()}
          >
            Refresh list
          </button>
        </div>
      </form>
        </div>

        <section className="create-library-panel" aria-labelledby="guides-live-heading">
          <h2
            id="guides-live-heading"
            className="cond"
            style={{ fontSize: 20, margin: "0 0 8px", color: "#fff" }}
          >
            Live guide blocks
          </h2>
          <p className="create-muted" style={{ margin: "0 0 16px" }}>
            Each block must keep at least one link row.
          </p>
          <div className="create-library-scroll" style={{ maxHeight: "min(560px, 55vh)" }}>
            {guides.length === 0 ? (
              <p style={{ color: C.gray, margin: 0 }}>No blocks yet—use the form above.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {guides.map((section, si) => (
                  <div
                    key={`${section.cat}-${si}`}
                    style={{
                      border: "1px solid #252525",
                      borderRadius: 10,
                      padding: 14,
                      background: "#141414",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <strong style={{ color: C.lgray }}>
                        #{si + 1} · {section.cat}{" "}
                        <span style={{ color: section.cc }}>●</span>
                      </strong>
                      <button
                        type="button"
                        className="btn-text"
                        style={{ color: "#f87171" }}
                        disabled={busy}
                        onClick={() => void removeSection(si)}
                      >
                        Delete block
                      </button>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: C.gray }}>
                      {section.items.map((it, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: 13 }}>
                            [{it.type}] {it.label}
                          </span>{" "}
                          <button
                            type="button"
                            className="btn-text"
                            disabled={busy || section.items.length <= 1}
                            title={
                              section.items.length <= 1
                                ? "Keep at least one row per block"
                                : undefined
                            }
                            onClick={() => void removeItem(si, idx)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
