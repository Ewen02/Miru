import type { AnimeDetail } from "@miru/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";

/**
 * Renders a schema.org JSON-LD <script> in place. Next.js streams this inside
 * the RSC payload like any other element — no special metadata API needed.
 *
 * The payload is serialized with the `<` escaped to `<` so a malicious
 * field (e.g. a synopsis containing `</script>`) can't break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Sitewide WebSite node with a SearchAction wired to /search?q=. */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Miru",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Sitewide Organization node. */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Miru",
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
  };
}

/**
 * Maps an AnimeDetail to a TVSeries (series/ONA/OVA/special) or Movie node.
 * Only emits fields we actually have to avoid lying to crawlers.
 */
export function animeSchema(anime: AnimeDetail, canonicalPath: string): Record<string, unknown> {
  const isMovie = anime.format === "MOVIE";
  const description = anime.synopsis ? anime.synopsis.replace(/<[^>]+>/g, "").slice(0, 500) : undefined;

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isMovie ? "Movie" : "TVSeries",
    name: anime.title,
    url: absoluteUrl(canonicalPath),
    inLanguage: "ja",
  };

  if (anime.titleEn) node.alternateName = anime.titleEn;
  if (description) node.description = description;
  if (anime.coverUrl) node.image = anime.coverUrl;
  if (anime.genres.length > 0) node.genre = anime.genres;
  if (anime.year) node.datePublished = String(anime.year);
  if (anime.studioName) {
    node.productionCompany = { "@type": "Organization", name: anime.studioName };
  }
  if (!isMovie && anime.episodeCount) node.numberOfEpisodes = anime.episodeCount;
  if (anime.averageRating != null) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: anime.averageRating,
      bestRating: 10,
      worstRating: 1,
    };
  }
  return node;
}

/** schema.org Person node for /people and /characters detail pages. */
export function personSchema(params: {
  name: string;
  path: string;
  image?: string | null;
  description?: string | null;
}): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    url: absoluteUrl(params.path),
  };
  if (params.image) node.image = params.image;
  if (params.description) node.description = params.description.replace(/<[^>]+>/g, "").slice(0, 500);
  return node;
}

/** schema.org ProfilePage node for public user profiles /u/[handle]. */
export function profilePageSchema(params: {
  handle: string;
  displayName?: string | null;
  image?: string | null;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(`/u/${params.handle}`),
    mainEntity: {
      "@type": "Person",
      name: params.displayName ?? params.handle,
      alternateName: params.handle,
      ...(params.image ? { image: params.image } : {}),
    },
  };
}

/**
 * BreadcrumbList from an ordered list of {name, path} crumbs. The last crumb
 * is the current page; pass its path too so the chain is fully resolvable.
 */
export function breadcrumbSchema(crumbs: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
