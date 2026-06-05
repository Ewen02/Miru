import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero, EmptyState } from "@miru/ui";
import { redirect } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchUserAchievements } from "@/lib/server-achievements";
import { ShareAchievementButton } from "@/components/share-achievement-button";

interface AchievementsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AchievementsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "achievementsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/achievements", locale),
    robots: { index: false },
  };
}

export default async function AchievementsPage({ params }: AchievementsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [data, t] = await Promise.all([
    fetchUserAchievements(),
    getTranslations("achievementsPage"),
  ]);

  if (data === null) {
    redirect({ href: "/login?next=/achievements", locale });
    return null;
  }

  const unlockedByCode = new Map(data.unlocked.map((a) => [a.code, a]));

  return (
    <>
      <EditorialHero
        decorative
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("progress", { unlocked: data.unlocked.length, total: data.all.length })}
      />
      <main className="mx-auto max-w-300 px-7 pb-20 pt-10">
        {data.all.length === 0 ? (
          <EmptyState
            title={t("empty")}
            description={t("emptyDesc")}
            primaryAction={{ label: t("emptyCta"), href: "/" }}
          />
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.all.map((badge) => {
              const unlocked = unlockedByCode.get(badge.code);
              return (
                <article
                  key={badge.code}
                  className="flex items-start gap-4 rounded-xl border border-border-subtle bg-bg-surface p-4"
                  style={{ opacity: unlocked ? 1 : 0.5 }}
                >
                  <div
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border-subtle font-display text-xl"
                    style={{
                      color: unlocked ? "var(--color-accent)" : "var(--color-text-tertiary)",
                      backgroundColor: unlocked
                        ? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
                        : "transparent",
                    }}
                  >
                    {badge.icon ?? "★"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="m-0 font-body text-sm font-semibold text-text-primary">
                        {badge.name}
                      </h2>
                      {unlocked && (
                        <ShareAchievementButton
                          badgeName={badge.name}
                          badgeDescription={badge.description}
                          href="/achievements"
                        />
                      )}
                    </div>
                    <p className="m-0 mt-1 font-body text-xs leading-relaxed text-text-secondary">
                      {badge.description}
                    </p>
                    <p className="m-0 mt-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                      {unlocked
                        ? t("unlockedOn", {
                            date: new Date(unlocked.unlockedAt).toLocaleDateString(locale),
                          })
                        : t("locked")}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}
