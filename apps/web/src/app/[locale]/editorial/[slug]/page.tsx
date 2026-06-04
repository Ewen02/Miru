import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchArticle } from "@/lib/server-editorial";
import { JsonLd, articleSchema } from "@/lib/json-ld";

interface ArticlePageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await fetchArticle(slug).catch(() => null);
  if (!article) return { title: "Article" };
  const description = article.excerpt ?? article.title;
  const images = article.coverUrl ? [article.coverUrl] : undefined;
  return {
    title: article.title,
    description,
    alternates: buildAlternates(`/editorial/${slug}`, locale),
    openGraph: { title: `${article.title} — Miru`, description, images, type: "article" },
    twitter: { card: "summary_large_image", title: `${article.title} — Miru`, description, images },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const [article, t] = await Promise.all([
    fetchArticle(slug),
    getTranslations("editorialPage"),
  ]);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-180 px-7 pb-24 pt-12">
      <JsonLd
        data={articleSchema({
          title: article.title,
          path: `/editorial/${slug}`,
          authorName: article.authorName,
          description: article.excerpt,
          image: article.coverUrl,
          publishedAt: article.publishedAt,
        })}
      />

      <Link
        href="/editorial"
        className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
      >
        {t("backToEditorial")}
      </Link>

      <header className="mb-10 mt-4">
        {article.kicker && (
          <p className="m-0 mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
            {article.kicker}
          </p>
        )}
        <h1 className="m-0 mb-5 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-text-primary text-balance sm:text-5xl">
          {article.title}
        </h1>
        <p className="m-0 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          {t("by", { author: article.authorName })}
        </p>
      </header>

      {article.coverUrl && (
        <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border-subtle">
          <Image src={article.coverUrl} alt="" fill sizes="720px" className="object-cover" priority />
        </div>
      )}

      {article.excerpt && (
        <p className="m-0 mb-8 font-display text-xl font-medium leading-relaxed text-text-primary text-pretty">
          {article.excerpt}
        </p>
      )}

      <div className="whitespace-pre-wrap font-body text-base leading-relaxed text-text-secondary text-pretty">
        {article.body}
      </div>
    </main>
  );
}
