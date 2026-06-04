"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { EpisodeHeatmapDto, EpisodeReactionKind } from "@miru/types";
import { addEpisodeReaction, fetchEpisodeHeatmap } from "@/lib/episode-reactions-api";

const KINDS: { kind: EpisodeReactionKind; emoji: string }[] = [
  { kind: "love", emoji: "❤️" },
  { kind: "laugh", emoji: "😂" },
  { kind: "cry", emoji: "😢" },
  { kind: "shock", emoji: "😮" },
  { kind: "fire", emoji: "🔥" },
];

/**
 * Timestamped reaction heatmap for one episode. Renders a density bar (one cell
 * per bucket, opacity ∝ count), a moment slider, and reaction buttons. Fetches
 * its own data client-side so it can drop onto any server page cheaply.
 */
export function EpisodeHeatmap({
  episodeId,
  durationSeconds,
  isAuthenticated,
}: {
  episodeId: string;
  /** Episode length in seconds; falls back to 24min when unknown. */
  durationSeconds: number | null;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("episodeHeatmap");
  const router = useRouter();
  const total = durationSeconds && durationSeconds > 0 ? durationSeconds : 24 * 60;
  const [data, setData] = useState<EpisodeHeatmapDto | null>(null);
  const [mark, setMark] = useState(Math.floor(total / 2));
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    void fetchEpisodeHeatmap(episodeId).then((d) => {
      if (active) setData(d);
    });
    return () => {
      active = false;
    };
  }, [episodeId]);

  const bucketSeconds = data?.bucketSeconds ?? 30;
  const bucketCount = Math.max(1, Math.ceil(total / bucketSeconds));
  const byBucket = new Map((data?.buckets ?? []).map((b) => [Math.floor(b.from / bucketSeconds), b.total]));
  const max = Math.max(1, ...(data?.buckets ?? []).map((b) => b.total));

  const react = (kind: EpisodeReactionKind) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (pending) return;
    startTransition(async () => {
      const result = await addEpisodeReaction(episodeId, mark, kind);
      if (!("error" in result)) setData(result);
    });
  };

  const minute = Math.floor(mark / 60);

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <header className="mb-4 flex items-baseline gap-3">
        <h3 className="m-0 font-display text-lg font-semibold tracking-tight text-text-primary">
          {t("title")}
        </h3>
        <span className="font-mono text-[11px] text-text-tertiary">
          {t("reactionsCount", { count: data?.total ?? 0 })}
        </span>
      </header>

      {/* Density bar */}
      <div className="mb-4 flex h-12 items-end gap-px" aria-hidden>
        {Array.from({ length: bucketCount }, (_, i) => {
          const count = byBucket.get(i) ?? 0;
          const h = count === 0 ? 6 : 6 + Math.round((count / max) * 42);
          return (
            <span
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}px`,
                backgroundColor:
                  count === 0
                    ? "var(--color-bg-elevated)"
                    : "color-mix(in srgb, var(--color-accent) " + (25 + Math.round((count / max) * 60)) + "%, transparent)",
              }}
            />
          );
        })}
      </div>

      {data && data.total === 0 && (
        <p className="m-0 mb-4 font-body text-xs text-text-tertiary">{t("empty")}</p>
      )}

      {/* Moment picker + reactions */}
      <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
        {isAuthenticated ? t("pickMoment") : t("loginToReact")} {isAuthenticated && t("atMinute", { min: minute })}
      </p>
      <input
        type="range"
        min={0}
        max={total}
        step={bucketSeconds}
        value={mark}
        onChange={(e) => setMark(Number(e.target.value))}
        aria-label={t("atMinute", { min: minute })}
        className="mb-3 w-full accent-accent"
      />
      <div className="flex gap-2">
        {KINDS.map(({ kind, emoji }) => (
          <button
            key={kind}
            type="button"
            onClick={() => react(kind)}
            disabled={pending}
            aria-label={kind}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-base text-lg transition-colors duration-200 hover:bg-bg-elevated disabled:opacity-50"
          >
            {emoji}
          </button>
        ))}
      </div>
    </section>
  );
}
