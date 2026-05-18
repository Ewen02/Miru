"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReviewItem } from "@miru/types";
import { Button, cn } from "@miru/ui";
import { reviewApi } from "@/lib/review-api";

interface ReviewSectionProps {
  animeId: string;
  reviews: ReviewItem[];
  currentUserId: string | null;
}

const SPOILER_TAG = "[spoiler]";

export function ReviewSection({ animeId, reviews, currentUserId }: ReviewSectionProps) {
  const router = useRouter();

  const myReview = currentUserId ? reviews.find((r) => r.userId === currentUserId) ?? null : null;
  const othersReviews = currentUserId
    ? reviews.filter((r) => r.userId !== currentUserId)
    : reviews;

  return (
    <div className="flex flex-col gap-7 px-5">
      {currentUserId ? (
        <ReviewForm animeId={animeId} initial={myReview} onSubmitted={() => router.refresh()} />
      ) : (
        <p className="rounded-lg border border-border bg-bg-surface px-4 py-3 font-body text-sm text-text-secondary">
          Connecte-toi pour publier ta note et ton avis.
        </p>
      )}

      {othersReviews.length === 0 ? (
        <p className="font-body text-sm text-text-tertiary">
          {currentUserId ? "Aucun autre avis pour l'instant." : "Aucun avis pour l'instant."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {othersReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewForm({
  animeId,
  initial,
  onSubmitted,
}: {
  animeId: string;
  initial: ReviewItem | null;
  onSubmitted: () => void;
}) {
  const initialBodyHasSpoiler = initial?.body?.startsWith(SPOILER_TAG) ?? false;
  const initialCleanBody = initialBodyHasSpoiler
    ? initial!.body!.slice(SPOILER_TAG.length).trimStart()
    : initial?.body ?? "";

  const [rating, setRating] = useState(initial?.rating ?? 8);
  const [body, setBody] = useState(initialCleanBody);
  const [hasSpoilers, setHasSpoilers] = useState(initialBodyHasSpoiler);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    const serialized = trimmed
      ? hasSpoilers
        ? `${SPOILER_TAG} ${trimmed}`
        : trimmed
      : null;
    startTransition(async () => {
      try {
        await reviewApi.upsert(animeId, { rating, body: serialized });
        onSubmitted();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleDelete() {
    if (!initial) return;
    setError(null);
    startTransition(async () => {
      try {
        await reviewApi.remove(initial.id);
        setBody("");
        setRating(8);
        setHasSpoilers(false);
        onSubmitted();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  // Slider percentage (0..1) used to fill the accent track + position ticks.
  const sliderPct = ((rating - 1) / 9) * 100;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-surface p-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            {initial ? "Ton avis" : "Donne ton avis"}
          </h3>
          <p className="font-body text-xs text-text-tertiary">
            {initial
              ? "Mets à jour ta note ou ton commentaire."
              : "Partage ce que tu en as pensé — sans gâcher la surprise des autres."}
          </p>
        </div>
        {initial && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="font-mono text-[10px] tracking-[0.18em] text-text-tertiary uppercase transition-colors duration-200 hover:text-error disabled:cursor-not-allowed"
          >
            Supprimer
          </button>
        )}
      </div>

      {/* Rating slider with ticks */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
            Ta note
          </span>
          <span className="inline-flex items-baseline gap-1 font-display text-2xl font-semibold leading-none">
            <span style={{ color: "var(--color-accent)" }}>{rating}</span>
            <span className="font-body text-xs text-text-tertiary">/10</span>
          </span>
        </div>

        <div className="relative">
          {/* Native range input — visually hidden, accessible */}
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={rating}
            aria-label="Ta note de 1 à 10"
            className={cn(
              "h-7 w-full cursor-pointer appearance-none bg-transparent",
              // WebKit
              "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
              "[&::-webkit-slider-runnable-track]:border [&::-webkit-slider-runnable-track]:border-border-subtle",
              "[&::-webkit-slider-runnable-track]:bg-bg-base",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:[background:var(--color-accent)]",
              "[&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:cursor-pointer",
              // Firefox
              "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full",
              "[&::-moz-range-track]:border [&::-moz-range-track]:border-border-subtle",
              "[&::-moz-range-track]:bg-bg-base",
              "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:[background:var(--color-accent)] [&::-moz-range-thumb]:border-0",
            )}
          />
          {/* Accent fill behind the thumb */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-2.5 left-0 h-2 rounded-full opacity-30"
            style={{
              width: `${sliderPct}%`,
              backgroundColor: "var(--color-accent)",
            }}
          />
          {/* Tick numbers */}
          <div className="mt-1 flex justify-between px-0.5 font-mono text-[9px] text-text-quaternary">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
          Commentaire (optionnel)
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Qu'est-ce qui t'a marqué ?"
          className="resize-y rounded-lg border border-border-subtle bg-bg-base px-3 py-2 font-body text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
      </label>

      {/* Footer row: spoiler + submit */}
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 font-body text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={hasSpoilers}
            onChange={(e) => setHasSpoilers(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded-sm border border-border bg-bg-base accent-accent"
          />
          Contient des spoilers
        </label>

        {error && (
          <p role="alert" className="font-body text-xs text-error">
            {error}
          </p>
        )}

        <div className="flex-1" />

        <Button
          type="submit"
          disabled={pending}
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          {pending ? "Envoi…" : initial ? "Mettre à jour" : "Publier l'avis"}
        </Button>
      </div>
    </form>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const hasSpoilerTag = review.body?.startsWith(SPOILER_TAG) ?? false;
  const cleanBody = hasSpoilerTag
    ? review.body!.slice(SPOILER_TAG.length).trimStart()
    : review.body;
  const [revealed, setRevealed] = useState(false);

  return (
    <li className="rounded-lg border border-border bg-bg-surface px-4 py-3.5">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-display text-sm font-semibold text-text-primary">
          {review.author.name}
        </span>
        <span
          className="font-display text-base font-semibold"
          style={{ color: "var(--color-accent)" }}
        >
          {review.rating}
          <span className="font-body text-xs text-text-tertiary">/10</span>
        </span>
        {hasSpoilerTag && (
          <span className="rounded-sm bg-warn/15 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-warn uppercase">
            spoilers
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-text-tertiary">
          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
        </span>
      </div>
      {cleanBody && (
        hasSpoilerTag && !revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="w-full rounded-md border border-dashed border-border bg-bg-base/40 px-3 py-2 text-center font-body text-xs text-text-tertiary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-secondary"
          >
            Cliquer pour révéler les spoilers
          </button>
        ) : (
          <p className="whitespace-pre-line font-body text-sm leading-relaxed text-text-secondary">
            {cleanBody}
          </p>
        )
      )}
    </li>
  );
}
