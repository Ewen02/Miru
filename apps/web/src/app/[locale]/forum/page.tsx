import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchForumThreads } from "@/lib/server-forum";
import { getServerSession } from "@/lib/server-auth";
import { NewThreadForm } from "@/components/forum/new-thread-form";
import type { ForumCategory } from "@miru/types";

interface ForumPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

const CATEGORIES: ForumCategory[] = ["GENERAL", "RECOMMENDATIONS", "NEWS", "HELP", "OFFTOPIC"];

export async function generateMetadata({ params }: ForumPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forumPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/forum", locale),
  };
}

export default async function ForumPage({ params, searchParams }: ForumPageProps) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("forumPage"),
  ]);
  setRequestLocale(locale);
  const activeCategory = sp.category && CATEGORIES.includes(sp.category as ForumCategory) ? sp.category : null;
  const [threads, session] = await Promise.all([
    fetchForumThreads(activeCategory ?? undefined),
    getServerSession(),
  ]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-200 px-7 pb-20 pt-10">
        {/* Category filter */}
        <nav className="mb-6 flex flex-wrap gap-1" aria-label={t("category")}>
          <CategoryChip href="/forum" label={t("catAll")} active={!activeCategory} />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              href={`/forum?category=${c}`}
              label={t(`cat${c}`)}
              active={activeCategory === c}
            />
          ))}
        </nav>

        <div className="mb-6">
          <NewThreadForm isAuthenticated={!!session} />
        </div>

        {threads.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-px overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-0">
            {threads.map((thread) => (
              <li key={thread.id} className="border-b border-border-subtle last:border-0">
                <Link
                  href={`/forum/${thread.id}`}
                  className="flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-bg-elevated"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-body text-sm font-semibold text-text-primary">
                      {thread.title}
                    </p>
                    <p className="m-0 mt-0.5 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                      {t(`cat${thread.category}`)} · {thread.authorName}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-text-tertiary">
                    {t("postsCount", { count: thread.postCount })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200"
      style={{
        backgroundColor: active ? "var(--color-accent)" : "var(--color-bg-surface)",
        color: active ? "var(--color-bg-base)" : "var(--color-text-secondary)",
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      {label}
    </Link>
  );
}
