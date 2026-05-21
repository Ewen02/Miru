import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("helpPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function HelpPage() {
  const t = await getTranslations("helpPage");
  const CATEGORIES = [
    {
      title: t("categoryGettingStarted"),
      articles: [
        t("articleCreateAccount"),
        t("articleImportAniList"),
        t("articleUnderstandStatuses"),
      ],
    },
    {
      title: t("categoryWatchlist"),
      articles: [
        t("articleRateAnime"),
        t("articleMarkWatched"),
        t("articleScoreDiff"),
      ],
    },
    {
      title: t("categoryProfile"),
      articles: [
        t("articleMakeProfilePublic"),
        t("articleFollow"),
        t("articleBlock"),
      ],
    },
    {
      title: t("categoryAccount"),
      articles: [
        t("articleChangeEmail"),
        t("articleExport"),
        t("articleDeleteAccount"),
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("eyebrow")}
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {t("title")}
        </h1>
      </header>

      <div className="mb-10">
        <input
          type="search"
          placeholder={t("searchPlaceholder")}
          className="h-12 w-full rounded-md border border-border bg-bg-surface px-4 font-body text-sm text-text-primary placeholder:text-text-quaternary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <article key={cat.title} className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
            <h2 className="m-0 mb-4 font-display text-lg font-semibold tracking-tight text-text-primary">
              {cat.title}
            </h2>
            <ul className="m-0 flex flex-col gap-2 p-0">
              {cat.articles.map((a) => (
                <li key={a} className="font-body text-sm">
                  <a
                    href="#"
                    className="text-text-secondary transition-colors duration-200 hover:text-accent"
                  >
                    → {a}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <footer className="mt-12 rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
        <p className="m-0 mb-3 font-body text-sm text-text-secondary">
          {t("notFoundQ")}
        </p>
        <a
          href="mailto:support@miru.app"
          className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          {t("contactUs")}
        </a>
      </footer>
    </main>
  );
}
