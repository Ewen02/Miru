import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { Link, redirect } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchActivityFeed } from "@/lib/server-social";
import type { ActivityEventDto, ActivityKind } from "@miru/types";

interface ActivityPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "activityPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/activity", locale),
    robots: { index: false },
  };
}

const KIND_KEY: Record<ActivityKind, string> = {
  RATED_ANIME: "ratedAnime",
  COMPLETED_ANIME: "completedAnime",
  ADDED_TO_WATCHLIST: "addedToWatchlist",
  CREATED_LIST: "createdList",
  UNLOCKED_ACHIEVEMENT: "unlockedAchievement",
};

function targetLabel(event: ActivityEventDto): string {
  return event.anime?.title ?? event.list?.title ?? event.achievement?.name ?? "—";
}

function targetHref(event: ActivityEventDto): string | null {
  if (event.anime) return `/anime/${event.anime.slug}`;
  if (event.list) return `/lists/${event.list.id}`;
  return null;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [feed, t] = await Promise.all([
    fetchActivityFeed(40),
    getTranslations("activityPage"),
  ]);

  if (feed === null) {
    redirect({ href: "/login?next=/activity", locale });
    return null;
  }

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-180 px-7 pb-20 pt-10">
        {feed.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-px overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-0">
            {feed.map((event) => {
              const label = targetLabel(event);
              const href = targetHref(event);
              const verb = t(KIND_KEY[event.kind], { title: label });
              return (
                <li
                  key={event.id}
                  className="flex items-baseline gap-3 border-b border-border-subtle p-4 last:border-0"
                >
                  <Link
                    href={`/u/${event.actorName}`}
                    className="shrink-0 font-body text-sm font-semibold text-text-primary hover:text-accent"
                  >
                    {event.actorName}
                  </Link>
                  <span className="min-w-0 flex-1 font-body text-sm text-text-secondary">
                    {href ? (
                      <Link href={href} className="hover:text-text-primary">
                        {verb}
                      </Link>
                    ) : (
                      verb
                    )}
                  </span>
                  <time className="shrink-0 font-mono text-[11px] text-text-tertiary">
                    {new Date(event.createdAt).toLocaleDateString(locale)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
