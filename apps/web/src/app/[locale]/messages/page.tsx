import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero, cn } from "@miru/ui";
import { Link, redirect } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchConversations } from "@/lib/server-messages";
import { MonogramAvatar } from "@/components/monogram-avatar";

interface MessagesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MessagesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "messagesPage" });
  return {
    title: t("metaTitle"),
    alternates: buildAlternates("/messages", locale),
    robots: { index: false },
  };
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [conversations, t] = await Promise.all([
    fetchConversations(),
    getTranslations("messagesPage"),
  ]);

  const formatLastMessageAt = (iso: string | null): string | null => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
  };

  if (conversations === null) {
    redirect({ href: "/login?next=/messages", locale });
    return null;
  }

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-160 px-7 pb-20 pt-10">
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-px overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-0">
            {conversations.map((c) => {
              const dateLabel = formatLastMessageAt(c.lastMessageAt);
              const unread = c.unreadCount > 0;
              return (
                <li key={c.id} className="border-b border-border-subtle last:border-0">
                  <Link
                    href={`/messages/${c.id}`}
                    className="relative flex items-center gap-3 p-4 transition-colors duration-200 hover:bg-bg-elevated"
                  >
                    {unread && (
                      <span
                        aria-hidden
                        className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
                      />
                    )}
                    <MonogramAvatar image={c.peer.image} name={c.peer.name} size="md" />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate font-body text-sm",
                        unread ? "font-semibold text-text-primary" : "text-text-secondary",
                      )}
                    >
                      {c.peer.name}
                    </span>
                    {unread && (
                      <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-bg-base">
                        {t("unread", { count: c.unreadCount })}
                      </span>
                    )}
                    {dateLabel && (
                      <time className="shrink-0 font-mono text-[11px] text-text-tertiary">
                        {dateLabel}
                      </time>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

