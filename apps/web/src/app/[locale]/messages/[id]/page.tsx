import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchConversation } from "@/lib/server-messages";
import { getServerSession } from "@/lib/server-auth";
import { ConversationView } from "@/components/messages/conversation-view";

interface ConversationPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: ConversationPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: "messagesPage" });
  return {
    title: t("metaTitle"),
    alternates: buildAlternates(`/messages/${id}`, locale),
    robots: { index: false },
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const [conversation, session, t] = await Promise.all([
    fetchConversation(id),
    getServerSession(),
    getTranslations("messagesPage"),
  ]);

  if (!session) {
    redirect({ href: `/login?next=/messages/${id}`, locale });
    return null;
  }
  if (!conversation) {
    redirect({ href: "/messages", locale });
    return null;
  }

  return (
    <main className="mx-auto max-w-160 px-7 pb-20 pt-12">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <Link
          href="/messages"
          className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          {t("backToInbox")}
        </Link>
        <h1 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
          {conversation.peer.name}
        </h1>
      </div>
      <ConversationView conversation={conversation} viewerId={session.user.id} />
    </main>
  );
}
