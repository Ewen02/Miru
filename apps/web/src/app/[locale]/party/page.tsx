import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { buildAlternates } from "@/lib/alternates";
import { getServerSession } from "@/lib/server-auth";
import { WatchPartyRoom } from "@/components/watch-party/watch-party-room";

interface PartyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PartyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "watchPartyPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/party", locale),
  };
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [session, t] = await Promise.all([getServerSession(), getTranslations("watchPartyPage")]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
      <main className="mx-auto max-w-160 px-7 pb-20 pt-10">
        <WatchPartyRoom isAuthenticated={!!session} />
      </main>
    </>
  );
}
