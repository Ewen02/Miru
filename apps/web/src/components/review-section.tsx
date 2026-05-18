"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReviewItem } from "@miru/types";
import { Button } from "@miru/ui";
import { reviewApi } from "@/lib/review-api";

interface ReviewSectionProps {
  animeId: string;
  reviews: ReviewItem[];
  currentUserId: string | null;
}

export function ReviewSection({ animeId, reviews, currentUserId }: ReviewSectionProps) {
  const router = useRouter();

  const myReview = currentUserId ? reviews.find((r) => r.userId === currentUserId) ?? null : null;
  const othersReviews = currentUserId
    ? reviews.filter((r) => r.userId !== currentUserId)
    : reviews;

  return (
    <div className="flex flex-col gap-8 px-5">
      {currentUserId ? (
        <ReviewForm animeId={animeId} initial={myReview} onSubmitted={() => router.refresh()} />
      ) : (
        <p className="rounded-md border border-border bg-bg-surface px-4 py-3 font-body text-sm text-text-secondary">
          Connecte-toi pour publier ta note et ton avis.
        </p>
      )}

      {othersReviews.length === 0 ? (
        <p className="font-body text-sm text-text-tertiary">
          {currentUserId ? "Aucun autre avis pour l'instant." : "Aucun avis pour l'instant."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
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
  const [rating, setRating] = useState(initial?.rating ?? 8);
  const [body, setBody] = useState(initial?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await reviewApi.upsert(animeId, {
          rating,
          body: body.trim() || null,
        });
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
        onSubmitted();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-bg-surface p-5"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          {initial ? "Ton avis" : "Donne ton avis"}
        </h3>
        {initial && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary hover:text-error"
          >
            Supprimer
          </button>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-body text-xs text-text-tertiary">Note (1-10)</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="flex-1 accent-accent"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={rating}
          />
          <span
            className="w-10 text-right font-display text-xl font-bold"
            style={{ color: "var(--color-accent)" }}
          >
            {rating}
          </span>
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-body text-xs text-text-tertiary">Commentaire (optionnel)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Qu'est-ce qui t'a marqué ?"
          className="resize-y rounded-md border border-border bg-bg-elevated px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
      </label>

      {error && (
        <p role="alert" className="font-body text-xs text-error">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-end">
        {pending ? "Envoi…" : initial ? "Mettre à jour" : "Publier"}
      </Button>
    </form>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <li className="rounded-lg border border-border bg-bg-surface px-4 py-3.5">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-display text-sm font-semibold text-text-primary">
          {review.author.name}
        </span>
        <span
          className="font-display text-base font-bold"
          style={{ color: "var(--color-accent)" }}
        >
          {review.rating}/10
        </span>
        <span className="ml-auto font-mono text-[10px] text-text-tertiary">
          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
        </span>
      </div>
      {review.body && (
        <p className="whitespace-pre-line font-body text-sm leading-relaxed text-text-secondary">
          {review.body}
        </p>
      )}
    </li>
  );
}
