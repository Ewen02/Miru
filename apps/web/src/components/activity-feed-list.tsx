"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ActivityEventDto, ActivityKind } from "@miru/types";

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

/**
 * Renders a list of activity events. Shared between the personal feed
 * (/activity) and the global trending feed (/trending). The verb strings live
 * in the `activityPage` namespace; pass `locale` for date formatting.
 */
export function ActivityFeedList({
  events,
  locale,
}: {
  events: ActivityEventDto[];
  locale: string;
}) {
  const t = useTranslations("activityPage");

  return (
    <ul className="m-0 flex list-none flex-col gap-px overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-0">
      {events.map((event) => {
        const href = targetHref(event);
        const verb = t(KIND_KEY[event.kind], { title: targetLabel(event) });
        return (
          <li
            key={event.id}
            className="flex items-baseline gap-3 border-b border-border-subtle p-4 last:border-0"
          >
            <Link
              href={`/u/${event.userId}`}
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
  );
}
