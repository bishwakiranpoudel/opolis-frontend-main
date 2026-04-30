import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { C } from "@/lib/constants";
import {
  getPodcastEpisodeBySlug,
  getPodcastEpisodes,
  PODCAST_SERIES_META,
  podcastEpisodePath,
  podcastEpisodesInSeries,
  podcastEpisodesOutsideSeries,
} from "@/lib/podcasts";
import { extractYoutubeVideoId } from "@/lib/podcastTypes";
import { playlistYoutubeIdForPodcastSlug } from "@/lib/podcastYoutubeSlugMap";
import {
  decodeHtmlEntitiesLite,
  getPodcastNeighbors,
  sortPodcastsChronological,
  stripAllYoutubeIframes,
} from "@/lib/podcastContent";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(str: string, max: number): string {
  const s = str.trim();
  if (s.length <= max) return s;
  return s.slice(0, max).trim().replace(/\s+\S*$/, "") + "…";
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const eps = await getPodcastEpisodes();
  return eps.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ep = await getPodcastEpisodeBySlug(slug);
  if (!ep) return { title: "Not Found" };
  const title = decodeHtmlEntitiesLite(ep.title);
  const description = truncate(stripHtml(ep.excerptHtml), 155);
  return buildMetadata({
    title: `${title} | Opolis Podcast`,
    description: description || "Listen or watch on the Opolis podcast.",
    path: podcastEpisodePath(slug),
    openGraph: { type: "article" },
  });
}

const SAME_SERIES_SIDEBAR = 10;
const OTHER_SERIES_SIDEBAR = 6;

export default async function PodcastEpisodePage({ params }: PageProps) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) notFound();

  const path = podcastEpisodePath(slug);
  const all = await getPodcastEpisodes();
  const seriesChronological = sortPodcastsChronological(
    all.filter((e) => e.seriesKey === episode.seriesKey)
  );
  const { older, newer } = getPodcastNeighbors(seriesChronological, slug);

  const moreFromSeries = podcastEpisodesInSeries(
    all,
    episode.seriesKey,
    slug,
    SAME_SERIES_SIDEBAR
  );
  const exploreOtherSeries =
    episode.seriesKey !== "unknown"
      ? podcastEpisodesOutsideSeries(
          all,
          episode.seriesKey,
          slug,
          OTHER_SERIES_SIDEBAR
        )
      : all
          .filter((e) => e.slug !== slug)
          .sort((a, b) => (b.dateIso || "").localeCompare(a.dateIso || ""))
          .slice(0, OTHER_SERIES_SIDEBAR);

  const seriesBadge = PODCAST_SERIES_META[episode.seriesKey];

  const html = episode.contentHtml;
  /** Curated playlists / Firestore must win: WP HTML often repeats one playlist share URL for every episode. */
  const curatedId = playlistYoutubeIdForPodcastSlug(slug);
  const storedId = episode.youtubeVideoId?.trim();
  const storedOk =
    storedId && /^[a-zA-Z0-9_-]{11}$/.test(storedId) ? storedId : undefined;
  const fromWpHtml = extractYoutubeVideoId(
    [episode.contentHtml, episode.excerptHtml, episode.thumbnailUrl ?? ""].join(
      "\n"
    )
  );
  const ytId = curatedId ?? storedOk ?? fromWpHtml;

  /** One reliable nocookie player; strip WP iframes that often break or duplicate. */
  const showTopEmbed = !!ytId;
  const bodyHtml =
    showTopEmbed && ytId ? stripAllYoutubeIframes(html) : html;

  const displayTitle = decodeHtmlEntitiesLite(episode.title);

  const articleLd = articleJsonLd({
    title: displayTitle,
    description: truncate(stripHtml(episode.excerptHtml), 160),
    date: episode.dateIso,
    modified: episode.modifiedIso,
    path,
    image: episode.thumbnailUrl,
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Podcast", path: "/resources/podcasts" },
    { name: displayTitle, path },
  ]);

  const linkStyle: CSSProperties = {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleLd),
        }}
      />
      <section className="sec-alt">
        <div className="wrap">
          <div className="blog-post-layout">
            <article className="blog-post-main">
              <div style={{ marginBottom: 16 }}>
                <span
                  className="pill"
                  style={{
                    display: "inline-block",
                    marginRight: 10,
                    marginBottom: 8,
                    padding: "6px 14px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderRadius: 20,
                    background: C.red,
                    color: "#000",
                  }}
                >
                  {seriesBadge.shortLabel}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.lgray,
                  }}
                >
                  {episode.seriesTitle}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    fontSize: 12,
                    color: C.gray,
                  }}
                >
                  {episode.seriesKey === "unemployable"
                    ? `${episode.seriesTitle} · ${episode.episodeSeasonLabel}`
                    : episode.seasonLabel}
                </span>
              </div>
              <h1
                className="cond serif"
                style={{
                  fontSize: "clamp(28px,4vw,42px)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: 12,
                }}
              >
                {displayTitle}
              </h1>
              <time
                dateTime={episode.dateIso}
                style={{
                  fontSize: 14,
                  color: C.gray,
                  marginBottom: showTopEmbed && ytId ? 24 : 20,
                  display: "block",
                }}
              >
                {episode.date}
              </time>

              {showTopEmbed && ytId ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    marginBottom: 28,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1px solid ${C.border}`,
                    background: "#0a0a0a",
                  }}
                >
                  <iframe
                    title="YouTube episode player"
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="eager"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                </div>
              ) : null}

              {(older || newer) && (
                <nav
                  aria-label="Episode navigation"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    flexWrap: "wrap",
                    marginBottom: 28,
                    padding: "16px 0",
                    borderTop: `1px solid ${C.border}`,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                    {older ? (
                      <Link
                        href={podcastEpisodePath(older.slug)}
                        style={linkStyle}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: C.gray,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          ← Older in series
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.lgray,
                            lineHeight: 1.4,
                          }}
                        >
                          {truncate(decodeHtmlEntitiesLite(older.title), 72)}
                        </span>
                      </Link>
                    ) : (
                      <span style={{ fontSize: 13, color: C.gray }}>
                        First in this series
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      flex: "1 1 160px",
                      minWidth: 0,
                      textAlign: "right",
                    }}
                  >
                    {newer ? (
                      <Link
                        href={podcastEpisodePath(newer.slug)}
                        style={{ ...linkStyle, textAlign: "right" }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: C.gray,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Newer in series →
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.lgray,
                            lineHeight: 1.4,
                          }}
                        >
                          {truncate(decodeHtmlEntitiesLite(newer.title), 72)}
                        </span>
                      </Link>
                    ) : (
                      <span
                        style={{
                          fontSize: 13,
                          color: C.gray,
                          display: "block",
                          textAlign: "right",
                        }}
                      >
                        Latest in series
                      </span>
                    )}
                  </div>
                </nav>
              )}

              {episode.thumbnailUrl && !showTopEmbed ? (
                <figure style={{ margin: "0 0 28px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={episode.thumbnailUrl}
                    alt=""
                    style={{
                      width: "100%",
                      maxHeight: 420,
                      objectFit: "cover",
                      borderRadius: 12,
                      display: "block",
                      border: "1px solid #252525",
                    }}
                  />
                </figure>
              ) : null}
              <div
                className="blog-content podcast-episode-body"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </article>
            <aside className="blog-sidebar podcast-sidebar">
              <Link
                href="/resources/podcasts"
                style={{
                  display: "inline-block",
                  marginBottom: 28,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.red,
                  textDecoration: "none",
                }}
              >
                ← All episodes
              </Link>
              {moreFromSeries.length > 0 && (
                <>
                  <h3
                    className="cond"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    More from {episode.seriesTitle}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: C.gray,
                      marginBottom: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    Suggested episodes in the same series, newest first.
                  </p>
                  <ul className="blog-sidebar-list">
                    {moreFromSeries.map((p) => (
                      <li key={p.slug} className="blog-sidebar-item">
                        <Link
                          href={podcastEpisodePath(p.slug)}
                          className="blog-sidebar-item__link podcast-sidebar-item__link"
                        >
                          <span className="podcast-sidebar-item__row">
                            {p.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                className="podcast-sidebar-item__thumb"
                                src={p.thumbnailUrl}
                                alt=""
                              />
                            ) : (
                              <span
                                className="podcast-sidebar-item__thumb podcast-sidebar-item__thumb--placeholder"
                                aria-hidden
                              />
                            )}
                            <span className="podcast-sidebar-item__text">
                              <span className="blog-sidebar-item__title">
                                {decodeHtmlEntitiesLite(p.title)}
                              </span>
                              <span className="blog-sidebar-item__meta">
                                {p.date}
                              </span>
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {exploreOtherSeries.length > 0 && (
                <>
                  <h3
                    className="cond"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      marginTop: moreFromSeries.length ? 28 : 0,
                      marginBottom: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {episode.seriesKey !== "unknown"
                      ? "Other series"
                      : "More episodes"}
                  </h3>
                  <ul className="blog-sidebar-list">
                    {exploreOtherSeries.map((p) => (
                      <li key={p.slug} className="blog-sidebar-item">
                        <Link
                          href={podcastEpisodePath(p.slug)}
                          className="blog-sidebar-item__link podcast-sidebar-item__link"
                        >
                          <span className="podcast-sidebar-item__row">
                            {p.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                className="podcast-sidebar-item__thumb"
                                src={p.thumbnailUrl}
                                alt=""
                              />
                            ) : (
                              <span
                                className="podcast-sidebar-item__thumb podcast-sidebar-item__thumb--placeholder"
                                aria-hidden
                              />
                            )}
                            <span className="podcast-sidebar-item__text">
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  color: C.red,
                                  display: "block",
                                  marginBottom: 4,
                                }}
                              >
                                {PODCAST_SERIES_META[p.seriesKey].shortLabel}
                              </span>
                              <span className="blog-sidebar-item__title">
                                {decodeHtmlEntitiesLite(p.title)}
                              </span>
                              <span className="blog-sidebar-item__meta">
                                {p.date}
                              </span>
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
