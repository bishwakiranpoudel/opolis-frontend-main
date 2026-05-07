"use client";

import { useCallback, useState } from "react";
import { uploadCmsFileToStorage } from "@/lib/create-content/cms-upload-client";
import { C } from "@/lib/constants";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  getUploadHeaders: () => Promise<HeadersInit>;
  /** Called when upload fails (optional toast replacement). */
  onError?: (message: string) => void;
  accept?: string;
  optionalUrlFallback?: boolean;
};

export function CmsStorageUploadField({
  label,
  value,
  onChange,
  getUploadHeaders,
  onError,
  accept = "image/*",
  optionalUrlFallback = true,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const runUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const url = await uploadCmsFileToStorage(file, getUploadHeaders);
        onChange(url);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        if (onError) onError(msg);
        else window.alert(msg);
      } finally {
        setUploading(false);
      }
    },
    [getUploadHeaders, onChange, onError]
  );

  return (
    <div className="create-form-row create-cms-upload-field">
      <span className="slabel">{label}</span>
      <p
        className="create-muted create-cms-upload-field__hint"
        style={{ margin: "0 0 10px", fontSize: 13 }}
      >
        Upload a file — it is stored and the returned link is saved automatically.
      </p>
      <div className="create-cms-upload-field__actions">
        <label
          className="btn btn-outline"
          style={{
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.65 : 1,
            pointerEvents: uploading ? "none" : "auto",
          }}
        >
          {uploading ? "Uploading…" : value ? "Replace file" : "Choose file"}
          <input
            type="file"
            accept={accept}
            className="create-file-hidden"
            disabled={uploading}
            aria-busy={uploading}
            aria-label={label}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void runUpload(f);
            }}
          />
        </label>
        {value ? (
          <button
            type="button"
            className="btn-text"
            disabled={uploading}
            onClick={() => onChange("")}
          >
            Clear
          </button>
        ) : null}
      </div>
      {value ? (
        <div className="create-cms-upload-field__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            style={{
              maxHeight: 96,
              maxWidth: "100%",
              borderRadius: 8,
              border: "1px solid #252525",
              objectFit: "cover",
            }}
            onError={(ev) => {
              (ev.target as HTMLImageElement).style.display = "none";
            }}
          />
          <code
            style={{
              fontSize: 11,
              color: C.gray,
              wordBreak: "break-all",
              flex: "1 1 200px",
            }}
          >
            {value}
          </code>
        </div>
      ) : null}
      {optionalUrlFallback ? (
        <details className="create-cms-upload-field__details">
          <summary className="create-muted create-cms-upload-field__summary">
            Paste URL instead
          </summary>
          <input
            className="create-input create-cms-upload-field__paste-input"
            style={{ marginTop: 10 }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            aria-label={`${label}, paste URL`}
          />
        </details>
      ) : null}
    </div>
  );
}
