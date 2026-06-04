import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { buildAlternates } from "@/lib/alternates";
import { fetchPolls } from "@/lib/server-polls";
import { getServerSession } from "@/lib/server-auth";
import { PollCard } from "@/components/poll-card";

interface PollsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PollsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pollsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/polls", locale),
  };
}

export default async function PollsPage({ params }: PollsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [polls, session, t] = await Promise.all([
    fetchPolls(30),
    getServerSession(),
    getTranslations("pollsPage"),
  ]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-180 px-7 pb-20 pt-10">
        {polls.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} isAuthenticated={!!session} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
