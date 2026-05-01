"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { CmsStorageUploadField } from "@/components/create/CmsStorageUploadField";
import { TiptapBlogEditor } from "@/components/create/TiptapBlogEditor";
import type { PodcastEpisodeDoc } from "@/lib/firebase/types";
import { C } from "@/lib/constants";
import type { PodcastSeriesKey } from "@/lib/podcastTypes";

type EpisodeRow = {
  slug: string;
  title: string;
  dateIso: string;
  seriesKey: PodcastSeriesKey;
};

const SERIES_OPTIONS: { value: PodcastSeriesKey; label: string }[] = [
  { value: "unemployable", label: "Unemployable" },
  { value: "opolis-public-radio", label: "Opolis Public Radio" },
  { value: "unknown", label: "Unknown / generic" },
];

export function CreatePodcastsCrudClient() {
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const { token, ready, refreshIdToken } = useCreateToken();
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [slugManual, setSlugManual] = useState("");
  const [title, setTitle] = useState("");
  const [excerptHtml, setExcerptHtml] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [seriesKey, setSeriesKey] = useState<PodcastSeriesKey>("unemployable");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [excerptEditorKey, setExcerptEditorKey] = useState(0);
  const [bodyEditorKey, setBodyEditorKey] = useState(0);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const getUploadHeaders = useCallback(async () => {
    const t = await refreshIdToken();
    return createAuthHeaders(t);
  }, [refreshIdToken]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadErr(null);
    const res = await fetch("/api/create/podcasts", {
      headers: createAuthHeaders(token),
    });
    const data = (await res.json().catch(() => ({}))) as {
      episodes?: EpisodeRow[];
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load episodes");
      return;
    }
    setEpisodes(data.episodes ?? []);
  }, [token]);

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, load]);

  function resetForm() {
    setEditingSlug(null);
    setSlugManual("");
    setTitle("");
    setExcerptHtml("");
    setContentHtml("");
    setDateIso("");
    setSeriesKey("unemployable");
    setYoutubeVideoId("");
    setThumbnailUrl("");
    setExcerptEditorKey((k) => k + 1);
    setBodyEditorKey((k) => k + 1);
    setMsg(null);
  }

  async function beginEdit(slug: string) {
    if (!token) return;
    setMsg(null);
    const res = await fetch(
      `/api/create/podcasts?slug=${encodeURIComponent(slug)}`,
      { headers: createAuthHeaders(token) }
    );
    const data = (await res.json().catch(() => ({}))) as {
      episode?: PodcastEpisodeDoc;
      error?: string;
    };
    if (!res.ok || !data.episode) {
      setMsg({ ok: false, text: data.error || "Could not load episode" });
      return;
    }
    const e = data.episode;
    setEditingSlug(e.slug);
    setSlugManual(e.slug);
    setTitle(e.title);
    setExcerptHtml(e.excerptHtml ?? "");
    setContentHtml(e.contentHtml ?? "");
    setDateIso(e.dateIso ?? "");
    setSeriesKey((e.seriesKey as PodcastSeriesKey) || "unemployable");
    setYoutubeVideoId(e.youtubeVideoId ?? "");
    setThumbnailUrl(e.thumbnailUrl ?? "");
    setExcerptEditorKey((k) => k + 1);
    setBodyEditorKey((k) => k + 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        editorPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  async function onSubmit(formE: React.FormEvent) {
    formE.preventDefault();
    if (!token) return;
    setBusy(true);
    setMsg(null);
    try {
      const isEdit = Boolean(editingSlug);
      const base = {
        title,
        excerptHtml,
        contentHtml,
        dateIso: dateIso.trim() || undefined,
        seriesKey,
        youtubeVideoId: youtubeVideoId.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      };
      const bodyPayload = isEdit
        ? { ...base, slug: editingSlug }
        : {
            ...base,
            slug: slugManual.trim().toLowerCase() || undefined,
          };

      const res = await fetch("/api/create/podcasts", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Save failed" });
        return;
      }
      setMsg({
        ok: true,
        text: isEdit ? "Episode updated." : "Episode published.",
      });
      await load();
      if (!isEdit) resetForm();
    } finally {
      setBusy(false);
    }
  }

  async function removeEpisode(slug: string) {
    if (!token) return;
    if (!window.confirm(`Delete episode "${slug}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/create/podcasts?slug=${encodeURIComponent(slug)}`,
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
      if (editingSlug === slug) resetForm();
      setMsg({ ok: true, text: "Episode deleted." });
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
              <button type="button" className="btn-outline" onClick={resetForm}>
                New episode
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <h2
                className="cond"
                style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}
              >
                Compose episode
              </h2>
            </div>
          )}

          <form className="create-form" onSubmit={onSubmit}>
            {!editingSlug ? (
              <div className="create-form-row">
                <label className="slabel" htmlFor="pod-slug">
                  Slug (optional — derived from title if empty)
                </label>
                <input
                  id="pod-slug"
                  className="create-input"
                  value={slugManual}
                  onChange={(e) => setSlugManual(e.target.value)}
                  placeholder="my-episode-slug"
                />
              </div>
            ) : (
              <p className="create-muted">
                Slug: <code>{editingSlug}</code> (fixed)
              </p>
            )}

            <div className="create-form-row">
              <label className="slabel" htmlFor="pod-title">
                Title
              </label>
              <input
                id="pod-title"
                className="create-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="create-form-row--split">
              <div className="create-form-row">
                <label className="slabel" htmlFor="pod-series">
                  Series
                </label>
                <select
                  id="pod-series"
                  className="create-select"
                  value={seriesKey}
                  onChange={(e) =>
                    setSeriesKey(e.target.value as PodcastSeriesKey)
                  }
                >
                  {SERIES_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="create-form-row">
                <label className="slabel" htmlFor="pod-date">
                  Publish date
                </label>
                <input
                  id="pod-date"
                  className="create-input"
                  type="datetime-local"
                  value={dateIso ? dateIso.slice(0, 16) : ""}
                  onChange={(e) =>
                    setDateIso(
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : ""
                    )
                  }
                />
              </div>
            </div>

            <div className="create-form-row--split">
              <div className="create-form-row">
                <label className="slabel" htmlFor="pod-yt">
                  YouTube video ID
                </label>
                <input
                  id="pod-yt"
                  className="create-input"
                  value={youtubeVideoId}
                  onChange={(e) => setYoutubeVideoId(e.target.value)}
                  placeholder="optional"
                />
              </div>
              <CmsStorageUploadField
                label="Thumbnail"
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                getUploadHeaders={getUploadHeaders}
                onError={(text) => setMsg({ ok: false, text })}
                accept="image/*"
              />
            </div>

            <div className="create-form-row">
              <span className="slabel">Excerpt</span>
              <TiptapBlogEditor
                key={excerptEditorKey}
                initialHtml={excerptHtml}
                onChange={setExcerptHtml}
                getUploadHeaders={getUploadHeaders}
                placeholder="Intro shown on listings and cards…"
                shellClassName="create-editor-shell--compact"
              />
            </div>

            <div className="create-form-row">
              <span className="slabel">Episode body</span>
              <TiptapBlogEditor
                key={bodyEditorKey}
                initialHtml={contentHtml}
                onChange={setContentHtml}
                getUploadHeaders={getUploadHeaders}
                placeholder="Full episode notes, links, embed context…"
              />
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
              {busy ? "Saving…" : editingSlug ? "Update episode" : "Publish episode"}
            </button>
          </form>
        </div>

        <section className="create-library-panel" aria-labelledby="pod-library-heading">
          <div className="create-library-panel__head">
            <div>
              <h2
                id="pod-library-heading"
                className="cond"
                style={{ fontSize: 20, margin: 0, color: "#fff" }}
              >
                Episodes
              </h2>
            </div>
            <div className="create-library-panel__tools">
              <button type="button" className="btn-outline" onClick={resetForm}>
                + New episode
              </button>
              <button type="button" className="btn-outline" onClick={() => void load()}>
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
                  <th>Series</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {episodes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ color: C.gray }}>
                      No episodes (or loading).
                    </td>
                  </tr>
                ) : (
                  episodes.map((e) => (
                    <tr key={e.slug}>
                      <td>
                        <code>{e.slug}</code>
                      </td>
                      <td>{e.title}</td>
                      <td style={{ fontSize: 13, color: C.gray }}>
                        {e.seriesKey}
                      </td>
                      <td>
                        <div className="create-cms-actions">
                          <button
                            type="button"
                            className="btn-text"
                            onClick={() => void beginEdit(e.slug)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-text"
                            style={{ color: "#f87171" }}
                            onClick={() => void removeEpisode(e.slug)}
                          >
                            Delete
                          </button>
                          <Link
                            href={`/resources/podcasts/${e.slug}`}
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
