import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { NotificationItemDto } from "@miru/types";
import { fetchNotifications } from "@/lib/server-notifications";
import { MarkAllReadButton } from "./mark-all-read-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notificationsPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function NotificationsPage() {
  const [data, t, locale] = await Promise.all([
    fetchNotifications(),
    getTranslations("notificationsPage"),
    getLocale(),
  ]);
  if (!data) redirect("/login?next=/notifications");

  const unreadLine =
    data.unreadCount > 1
      ? t("unreadPlural", { unread: data.unreadCount, total: data.items.length })
      : t("unread", { unread: data.unreadCount, total: data.items.length });

  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {t("title")}
          </h1>
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">{unreadLine}</p>
        </div>
        <div className="flex items-center gap-2">
          {data.unreadCount > 0 && <MarkAllReadButton />}
          <Link
            href="/settings"
            aria-label={t("settingsAria")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-surface text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 mb-2 font-display text-base font-semibold text-text-primary">
            {t("emptyTitle")}
          </p>
          <p className="m-0 font-body text-sm text-text-tertiary">{t("emptyBody")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((n) => (
            <li key={n.id}>
              <NotificationCard notification={n} t={t} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

type T = (key: string, values?: Record<string, string | number>) => string;

function NotificationCard({
  notification: n,
  t,
  locale,
}: {
  notification: NotificationItemDto;
  t: T;
  locale: string;
}) {
  const isUnread = n.readAt == null;
  const Wrapper: React.ElementType = n.linkUrl ? Link : "div";
  const wrapperProps = n.linkUrl ? { href: n.linkUrl } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="relative flex gap-3 rounded-xl border border-border-subtle bg-bg-surface p-4 transition-colors duration-150 hover:bg-bg-elevated"
    >
      {isUnread && (
        <span
          aria-hidden
          className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-sm"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      )}
      <div
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle text-text-secondary"
        style={{ backgroundColor: "var(--color-bg-elevated)" }}
      >
        <KindIcon kind={n.kind} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 font-body text-sm font-medium text-text-primary">{n.title}</p>
        {n.excerpt && (
          <p className="m-0 mt-0.5 line-clamp-2 font-body text-xs text-text-secondary">
            {n.excerpt}
          </p>
        )}
      </div>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
        {formatRelative(n.createdAt, t, locale)}
      </span>
    </Wrapper>
  );
}

function KindIcon({ kind }: { kind: NotificationItemDto["kind"] }) {
  if (kind === "EPISODE_AIRED") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  if (kind === "REVIEW_REPLY") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z" />
      </svg>
    );
  }
  if (kind === "WEEKLY_RECAP") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 4 6-6" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function formatRelative(iso: string, t: T, locale: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return t("relJustNow");
  if (min < 60) return t("relMin", { n: min });
  const hours = Math.floor(min / 60);
  if (hours < 24) return t("relHour", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("relDay", { n: days });
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}
