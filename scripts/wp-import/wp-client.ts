import { wpHeaders, WORDPRESS_URL } from "./config";

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WPPostListItem {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified?: string;
  link: string;
  categories: number[];
  featured_media: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  mime_type: string;
  slug: string;
  title: { rendered: string };
}

export async function fetchJson<T>(url: string): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(url, { headers: wpHeaders() });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${url}`);
  }
  const data = (await res.json()) as T;
  return { data, headers: res.headers };
}

export async function fetchCategoriesMap(): Promise<Map<number, WPCategory>> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/wp/v2/categories?per_page=100&_fields=id,name,slug`;
  const { data } = await fetchJson<WPCategory[]>(url);
  const map = new Map<number, WPCategory>();
  if (Array.isArray(data)) {
    for (const c of data) {
      map.set(c.id, c);
    }
  }
  return map;
}

export async function fetchAllPostsFull(): Promise<WPPostListItem[]> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const fields =
    "id,slug,title,content,excerpt,date,modified,link,categories,featured_media";
  const firstUrl = `${base}/wp-json/wp/v2/posts?per_page=100&status=publish&_fields=${fields}`;
  const { data: first, headers } = await fetchJson<WPPostListItem[]>(firstUrl);
  const posts = Array.isArray(first) ? [...first] : [];
  const total = headers.get("X-WP-Total");
  const totalNum = total ? parseInt(total, 10) : posts.length;
  const totalPages = Math.max(1, Math.ceil(totalNum / 100));

  for (let page = 2; page <= totalPages; page++) {
    const url = `${base}/wp-json/wp/v2/posts?per_page=100&page=${page}&status=publish&_fields=${fields}`;
    const { data } = await fetchJson<WPPostListItem[]>(url);
    if (Array.isArray(data)) posts.push(...data);
  }
  return posts;
}

export async function fetchMediaItem(id: number): Promise<WPMedia | null> {
  if (!id) return null;
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/wp/v2/media/${id}?_fields=id,source_url,mime_type,slug,title`;
  try {
    const { data } = await fetchJson<WPMedia>(url);
    return data;
  } catch {
    return null;
  }
}

export async function countMediaItems(): Promise<number> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/wp/v2/media?per_page=1`;
  const res = await fetch(url, { headers: wpHeaders() });
  if (!res.ok) return 0;
  const total = res.headers.get("X-WP-Total");
  return total ? parseInt(total, 10) : 0;
}

export async function fetchWpTypes(): Promise<Record<string, unknown>> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/wp/v2/types`;
  try {
    const { data } = await fetchJson<Record<string, unknown>>(url);
    return data;
  } catch {
    return {};
  }
}

export async function tryFetchCustomGuides(): Promise<unknown> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/opolis/v1/guides`;
  const res = await fetch(url, { headers: wpHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function tryFetchCustomFaq(): Promise<unknown> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/opolis/v1/faq`;
  const res = await fetch(url, { headers: wpHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAllMediaPage(page: number): Promise<WPMedia[]> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  const url = `${base}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=id,source_url,mime_type,slug,title`;
  const { data } = await fetchJson<WPMedia[]>(url);
  return Array.isArray(data) ? data : [];
}
