import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Whitelist of help article slugs. Each slug must have matching
 * `<slug>-title` and `<slug>-body` keys in messages/{fr,en}.json
 * under the `helpPage` namespace. Adding an article = adding a slug
 * here + the 2 keys per locale.
 */
const ARTICLE_SLUGS = [
  "create-account",
  "import-anilist",
  "understand-statuses",
  "rate-anime",
  "mark-watched",
  "score-diff",
  "make-profile-public",
  "follow",
  "block",
  "change-email",
  "export",
  "delete-account",
] as const;

type ArticleSlug = (typeof ARTICLE_SLUGS)[number];

function isArticleSlug(value: string): value is ArticleSlug {
  return (ARTICLE_SLUGS as readonly string[]).includes(value);
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: HelpArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("helpPage");
  if (!isArticleSlug(slug)) return { title: t("articleNotFound") };
  return { title: t(`${slug}-title`) };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) notFound();
  const t = await getTranslations("helpPage");
  const title = t(`${slug}-title`);
  const body = t(`${slug}-body`);

  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <nav className="mb-8">
        <Link
          href="/help"
          className="inline-flex h-9 items-center font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          {t("backToHelp")}
        </Link>
      </nav>

      <article>
        <h1 className="m-0 mb-8 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {title}
        </h1>
        <div className="prose-tight max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
          {body.split(/\n\n+/).map((para, i) => (
            <p key={i} className="m-0 mb-5 last:mb-0">
              {renderBoldMarkdown(para)}
            </p>
          ))}
        </div>
      </article>

      <footer className="mt-16 rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
        <p className="m-0 mb-3 font-body text-sm font-medium text-text-primary">
          {t("stillStuck")}
        </p>
        <p className="m-0 mb-4 font-body text-xs text-text-tertiary">
          {t("writeUs")}
        </p>
        <a
          href="mailto:contact@miru.app"
          className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          contact@miru.app
        </a>
      </footer>
    </main>
  );
}

/**
 * Minimal markdown for **bold** spans. Keeps the body strings readable
 * in JSON without pulling a full markdown renderer.
 */
function renderBoldMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
