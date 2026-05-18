import { ImageResponse } from "next/og";
import { fetchAnimeDetail } from "@/lib/api";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Anime detail OG card";

interface OpenGraphImageProps {
  params: { slug: string };
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const anime = await fetchAnimeDetail(params.slug).catch(() => null);
  const accent = anime?.accentHex ?? "#c8a2ff";
  const title = anime?.title ?? "Miru";
  const studio = anime?.studioName ?? null;
  const year = anime?.year ?? null;
  const rating = anime?.averageRating ?? null;
  const cover = anime?.coverUrl ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#08080c",
          color: "white",
          fontFamily: "sans-serif",
          padding: 60,
          gap: 50,
          alignItems: "center",
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={300}
            height={420}
            style={{
              borderRadius: 12,
              objectFit: "cover",
              border: `2px solid ${accent}`,
            }}
          />
        ) : (
          <div
            style={{
              width: 300,
              height: 420,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${accent}, #08080c)`,
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Miru
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              marginTop: 16,
              marginBottom: 24,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              gap: 16,
            }}
          >
            {[studio, year?.toString()].filter(Boolean).join(" · ") || "Anime"}
          </div>
          {rating != null && (
            <div style={{ fontSize: 56, color: accent, fontWeight: 800, marginTop: 32 }}>
              {rating.toFixed(1)}
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
                / 10
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
