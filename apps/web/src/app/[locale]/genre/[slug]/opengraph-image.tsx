import { ImageResponse } from "next/og";
import { fetchGenreDetail } from "@/lib/api";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Miru — genre detail card";

const ACCENT = "#c8a2ff";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const detail = await fetchGenreDetail(slug).catch(() => null);
  const name = detail?.name ?? "Genre";
  const total = detail?.stats.totalAnimes ?? 0;
  const avgRating = detail?.stats.averageRating ?? null;

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
            top: -250,
            right: -250,
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: `radial-gradient(circle at center, ${ACCENT}40 0%, transparent 60%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 24,
          }}
        >
          miru · genre
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 160,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            marginBottom: 48,
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 60,
            fontSize: 28,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span>{total.toLocaleString("fr-FR")} titres</span>
          {avgRating != null && (
            <span style={{ color: ACCENT }}>★ {avgRating.toFixed(1)}</span>
          )}
        </div>
      </div>
    ),
    size,
  );
}
