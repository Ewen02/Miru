import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchForumThread } from "@/lib/server-forum";
import { getServerSession } from "@/lib/server-auth";
import { ThreadPosts } from "@/components/forum/thread-posts";

interface ThreadPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const [thread, t] = await Promise.all([
    fetchForumThread(id).catch(() => null),
    getTranslations({ locale, namespace: "forumPage" }),
  ]);
  if (!thread) return { title: t("metaTitle") };
  return {
    title: thread.title,
    description: thread.posts[0]?.body.slice(0, 160) ?? thread.title,
    alternates: buildAlternates(`/forum/${id}`, locale),
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const [thread, session, t] = await Promise.all([
    fetchForumThread(id),
    getServerSession(),
    getTranslations("forumPage"),
  ]);
  if (!thread) notFound();

  return (
    <main className="mx-auto max-w-200 px-7 pb-20 pt-12">
      <Link
        href="/forum"
        className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
      >
        {t("backToForum")}
      </Link>

      <header className="mb-8 mt-4">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t(`cat${thread.category}`)} · {thread.authorName}
        </p>
        <h1 className="m-0 font-display text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">
          {thread.title}
        </h1>
      </header>

      <ThreadPosts threadId={thread.id} initialPosts={thread.posts} isAuthenticated={!!session} />
    </main>
  );
}
