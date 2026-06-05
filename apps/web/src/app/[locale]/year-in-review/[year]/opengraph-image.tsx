import { ImageResponse } from "next/og";

/**
 * Year-in-Review share card. Renders the year prominently with the Miru
 * wordmark, then a tagline. Personal stats would require a public route
 * (Twitter/Discord crawlers don't carry the visitor's cookies) — that's
 * out of scope here. This generic card already gives shares context.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Miru — Year in review";

const ACCENT = "#c8a2ff";

interface Props {
  params: Promise<{ year: string; locale: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { year, locale } = await params;
  const safeYear = /^\d{4}$/.test(year) ? year : new Date().getFullYear().toString();
  const tagline =
    locale === "en" ? "An anime year, archived." : "Une année d'anime, archivée.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#08080c",
          color: "white",
          fontFamily: "sans-serif",
          padding: 80,
          // Accent corner blot.
          backgroundImage: `radial-gradient(ellipse at 100% 0%, ${ACCENT}22 0%, transparent 50%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          miru · year in review
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 240,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: ACCENT,
            }}
          >
            {safeYear}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 800,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <span>miru.app</span>
          <span style={{ color: ACCENT }}>
            #miru{safeYear}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
