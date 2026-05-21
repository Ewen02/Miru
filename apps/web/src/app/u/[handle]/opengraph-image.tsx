import { ImageResponse } from "next/og";
import { fetchUserProfile } from "@/lib/api";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Miru — user profile card";

const ACCENT = "#c8a2ff";

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { handle } = await params;
  const profile = await fetchUserProfile(handle).catch(() => null);
  const name = profile?.name ?? handle;
  const initial = name.charAt(0).toUpperCase();
  const completed = profile?.stats.completedCount ?? 0;
  const reviews = profile?.stats.reviewCount ?? 0;

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
          padding: 80,
          gap: 60,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "linear-gradient(160deg, #2d1844, #4a1d6b)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 110,
            fontWeight: 600,
            border: `4px solid ${ACCENT}`,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 16,
            }}
          >
            miru · @{handle.toLowerCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: 32,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              gap: 48,
              fontSize: 26,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <span>
              <span style={{ color: "white", fontWeight: 600 }}>{completed}</span> anime
              terminés
            </span>
            <span>
              <span style={{ color: ACCENT, fontWeight: 600 }}>{reviews}</span> avis publiés
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
