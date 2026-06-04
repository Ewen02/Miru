import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchArticles } from "@/lib/server-editorial";

interface EditorialPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: EditorialPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "editorialPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/editorial", locale),
  };
}

export default async function EditorialPage({ params }: EditorialPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [articles, t] = await Promise.all([fetchArticles(20), getTranslations("editorialPage")]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-200 px-7 pb-20 pt-10">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-secondary">{t("empty")}</p>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/editorial/${article.slug}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition-colors duration-150 hover:bg-bg-elevated"
                >
                  {article.coverUrl && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={article.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 400px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {article.kicker && (
                      <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                        {article.kicker}
                      </p>
                    )}
                    <h2 className="m-0 mb-2 font-display text-xl font-semibold tracking-tight text-text-primary text-balance">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="m-0 line-clamp-2 font-body text-sm text-text-secondary">
                        {article.excerpt}
                      </p>
                    )}
                    <p className="m-0 mt-3 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                      {t("by", { author: article.authorName })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
