/** Browser helper: POST multipart file to `/api/create/upload` (GCS via Firebase Admin). */

export async function uploadCmsFileToStorage(
  file: File,
  getUploadHeaders: () => Promise<HeadersInit>
): Promise<string> {
  const headers = await getUploadHeaders();
  if (!headers || Object.keys(headers).length === 0) {
    throw new Error("Sign in to upload files.");
  }
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/create/upload", {
    method: "POST",
    headers,
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "Upload failed");
  }
  if (!data.url) throw new Error("Upload failed");
  return data.url;
}
