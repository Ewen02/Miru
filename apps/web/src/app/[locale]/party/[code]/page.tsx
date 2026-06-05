import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { buildAlternates } from "@/lib/alternates";
import { getServerSession } from "@/lib/server-auth";
import { WatchPartyRoom } from "@/components/watch-party/watch-party-room";

interface PartyCodePageProps {
  params: Promise<{ locale: string; code: string }>;
}

/**
 * S3-08 — shareable party URL. The host gets `/party/{code}` after creating
 * a room and copies that link to friends. Anyone hitting the URL while
 * authenticated joins the in-memory room automatically; anonymous visitors
 * see the standard sign-in prompt.
 *
 * Codes are 6-char base32 (gateway alphabet), normalised to upper-case so
 * shares stay case-insensitive.
 */
export async function generateMetadata({
  params,
}: PartyCodePageProps): Promise<Metadata> {
  const { locale, code } = await params;
  const t = await getTranslations({ locale, namespace: "watchPartyPage" });
  const safeCode = sanitiseCode(code);
  return {
    title: t("metaTitleWithCode", { code: safeCode }),
    description: t("metaDescription"),
    alternates: buildAlternates(`/party/${safeCode}`, locale),
    robots: { index: false },
  };
}

export default async function PartyCodePage({ params }: PartyCodePageProps) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const safeCode = sanitiseCode(code);
  const [session, t] = await Promise.all([
    getServerSession(),
    getTranslations("watchPartyPage"),
  ]);

  return (
    <>
      <EditorialHero
        decorative
        eyebrow={t("eyebrow")}
        title={t("titleWithCode", { code: safeCode })}
        description={t("introJoin")}
      />
      <main className="mx-auto max-w-160 px-7 pb-20 pt-10">
        <WatchPartyRoom isAuthenticated={!!session} initialCode={safeCode} />
      </main>
    </>
  );
}

function sanitiseCode(raw: string): string {
  // Gateway alphabet is uppercase A-Z + digits, 6 chars max. Strip anything
  // unexpected so a tampered link never makes it into the join payload.
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}
