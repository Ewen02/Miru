import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/alternates";
import { fetchAnimeCatalog, fetchGenres } from "@/lib/api";
import { OnboardFlow } from "./onboard-flow";

interface OnboardPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: OnboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboardPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/onboard", locale),
  };
}

const STARTER_COUNT = 12;

export default async function OnboardPage({ params }: OnboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Fetch the data the client flow needs upfront — keeps it a pure
  // state-machine component without API concerns.
  const [starters, genres] = await Promise.all([
    fetchAnimeCatalog({ pageSize: STARTER_COUNT }).catch(() => null),
    fetchGenres().catch(() => []),
  ]);

  return (
    <OnboardFlow
      starters={
        starters?.data.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          coverUrl: a.coverUrl,
        })) ?? []
      }
      genres={genres.map((g) => ({ slug: g.slug, name: g.name }))}
    />
  );
}
