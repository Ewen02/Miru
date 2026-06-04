"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ReviewDetailDto } from "@miru/types";
import { addReviewComment } from "@/lib/review-comments-api";

/**
 * Comment list + post form for a review. The list updates in place from the
 * API response after posting. Unauthenticated visitors see a prompt to sign in.
 */
export function ReviewComments({
  reviewId,
  initialComments,
  isAuthenticated,
}: {
  reviewId: string;
  initialComments: ReviewDetailDto["comments"];
  isAuthenticated: boolean;
}) {
  const t = useTranslations("reviewPage");
  const locale = useLocale();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const text = body.trim();
    if (!text || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await addReviewComment(reviewId, text);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setComments(result.comments);
      setBody("");
    });
  };

  return (
    <section>
      <header className="mb-5 flex items-baseline gap-3">
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
          {t("commentsHeading")}
        </h2>
        <span className="font-mono text-[11px] text-text-tertiary">
          {t("commentsCount", { count: comments.length })}
        </span>
      </header>

      {isAuthenticated ? (
        <div className="mb-8">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder={t("placeholder")}
            className="w-full resize-y rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {error && <span className="font-body text-xs text-error">{error}</span>}
            <button
              type="button"
              onClick={submit}
              disabled={pending || body.trim().length === 0}
              className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base transition-opacity duration-200 disabled:opacity-50"
            >
              {t("submit")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mb-8 w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-left font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated"
        >
          {t("loginToComment")}
        </button>
      )}

      {comments.length === 0 ? (
        <p className="m-0 font-body text-sm text-text-tertiary">{t("noComments")}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border-subtle bg-bg-surface p-4">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="font-body text-sm font-semibold text-text-primary">
                  {comment.author.name}
                </span>
                <time className="font-mono text-[10px] text-text-tertiary">
                  {new Date(comment.createdAt).toLocaleDateString(locale)}
                </time>
              </div>
              <p className="m-0 whitespace-pre-wrap font-body text-sm leading-relaxed text-text-secondary">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
