import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchClubs } from "@/lib/server-clubs";
import { getServerSession } from "@/lib/server-auth";
import { CreateClubForm } from "@/components/clubs/create-club-form";

interface ClubsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ClubsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clubsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/clubs", locale),
  };
}

export default async function ClubsPage({ params }: ClubsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [clubs, session, t] = await Promise.all([
    fetchClubs(),
    getServerSession(),
    getTranslations("clubsPage"),
  ]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-200 px-7 pb-20 pt-10">
        <div className="mb-6">
          <CreateClubForm isAuthenticated={!!session} />
        </div>

        {clubs.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
            {clubs.map((club) => (
              <li key={club.id}>
                <Link
                  href={`/clubs/${club.slug}`}
                  className="block h-full rounded-2xl border border-border-subtle bg-bg-surface p-5 transition-colors duration-150 hover:bg-bg-elevated"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h2 className="m-0 font-display text-lg font-semibold tracking-tight text-text-primary">
                      {club.name}
                    </h2>
                    {club.isMember && (
                      <span className="shrink-0 rounded-sm border border-accent/40 bg-accent-subtle px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="m-0 mb-3 line-clamp-2 font-body text-sm text-text-secondary">
                    {club.description ?? ""}
                  </p>
                  <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    {t("members", { count: club.memberCount })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
