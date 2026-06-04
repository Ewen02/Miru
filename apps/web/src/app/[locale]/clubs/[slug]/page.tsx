import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchClub } from "@/lib/server-clubs";
import { getServerSession } from "@/lib/server-auth";
import { ClubWall } from "@/components/clubs/club-wall";

interface ClubPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: ClubPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const [club, t] = await Promise.all([
    fetchClub(slug).catch(() => null),
    getTranslations({ locale, namespace: "clubsPage" }),
  ]);
  if (!club) return { title: t("metaTitle") };
  return {
    title: club.name,
    description: club.description ?? club.name,
    alternates: buildAlternates(`/clubs/${slug}`, locale),
  };
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const [club, session, t] = await Promise.all([
    fetchClub(slug),
    getServerSession(),
    getTranslations("clubsPage"),
  ]);
  if (!club) notFound();

  return (
    <main className="mx-auto max-w-200 px-7 pb-20 pt-12">
      <Link
        href="/clubs"
        className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
      >
        {t("backToClubs")}
      </Link>

      <header className="mb-8 mt-4">
        <h1 className="m-0 font-display text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">
          {club.name}
        </h1>
        {club.description && (
          <p className="m-0 mt-2 max-w-160 font-body text-sm leading-relaxed text-text-secondary text-pretty">
            {club.description}
          </p>
        )}
      </header>

      <ClubWall club={club} isAuthenticated={!!session} />
    </main>
  );
}
