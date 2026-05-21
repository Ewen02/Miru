import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Miru — Explorer, organiser, partager.";

const ACCENT = "#c8a2ff";

/**
 * Default OG card used for the landing page and any route that doesn't ship
 * its own opengraph-image. Anime/Genre/Studio routes override this with
 * data-driven cards.
 */
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#08080c",
          color: "white",
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle at center, ${ACCENT}30 0%, transparent 60%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 32,
          }}
        >
          miru
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          Explorer,
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          organiser,
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: ACCENT,
            marginBottom: 48,
          }}
        >
          partager.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          4 500+ anime · gratuit · sans pub
        </div>
      </div>
    ),
    size,
  );
}
