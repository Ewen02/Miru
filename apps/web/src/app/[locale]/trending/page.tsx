import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { buildAlternates } from "@/lib/alternates";
import { fetchTrendingFeed } from "@/lib/api";
import { ActivityFeedList } from "@/components/activity-feed-list";

interface TrendingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TrendingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trendingPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/trending", locale),
  };
}

export default async function TrendingPage({ params }: TrendingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [feed, t] = await Promise.all([
    fetchTrendingFeed(40).catch(() => []),
    getTranslations("trendingPage"),
  ]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-180 px-7 pb-20 pt-10">
        {feed.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <ActivityFeedList events={feed} locale={locale} />
        )}
      </main>
    </>
  );
}
