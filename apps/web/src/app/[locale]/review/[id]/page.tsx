import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchReviewDetail } from "@/lib/server-review-detail";
import { getServerSession } from "@/lib/server-auth";
import { ReviewComments } from "@/components/review-comments";

interface ReviewPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const [review, t] = await Promise.all([
    fetchReviewDetail(id).catch(() => null),
    getTranslations({ locale, namespace: "reviewPage" }),
  ]);
  if (!review) return { title: t("notFound") };
  return {
    title: t("reviewOf", { title: review.animeTitle }),
    description: review.body ?? t("reviewOf", { title: review.animeTitle }),
    alternates: buildAlternates(`/review/${id}`, locale),
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const [review, session, t] = await Promise.all([
    fetchReviewDetail(id),
    getServerSession(),
    getTranslations("reviewPage"),
  ]);
  if (!review) notFound();

  return (
    <main className="mx-auto max-w-180 px-7 pb-20 pt-12">
      <Link
        href={`/anime/${review.animeSlug}`}
        className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
      >
        {t("backToAnime")}
      </Link>

      {/* Review header */}
      <header className="mb-10 mt-4">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("reviewOf", { title: review.animeTitle })}
        </p>
        <div className="mb-4 flex items-center gap-3">
          <span className="font-display text-4xl font-semibold leading-none text-accent">
            {review.rating}
            <span className="text-lg text-text-tertiary">/10</span>
          </span>
          <span className="font-body text-sm text-text-secondary">
            {review.author.name}
          </span>
        </div>
        {review.body && (
          <p className="m-0 whitespace-pre-wrap font-body text-base leading-relaxed text-text-primary text-pretty">
            {review.body}
          </p>
        )}
      </header>

      <ReviewComments
        reviewId={review.id}
        initialComments={review.comments}
        isAuthenticated={!!session}
      />
    </main>
  );
}
