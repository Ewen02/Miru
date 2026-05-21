import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("changelogPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ChangelogPage() {
  const t = await getTranslations("changelogPage");

  const releases = [
    {
      version: "0.5.0",
      date: t("v050Date"),
      title: t("v050Title"),
      items: [
        t("v050Item1"),
        t("v050Item2"),
        t("v050Item3"),
        t("v050Item4"),
        t("v050Item5"),
      ],
    },
    {
      version: "0.4.2",
      date: t("v042Date"),
      title: t("v042Title"),
      items: [t("v042Item1"), t("v042Item2"), t("v042Item3")],
    },
    {
      version: "0.4.0",
      date: t("v040Date"),
      title: t("v040Title"),
      items: [
        t("v040Item1"),
        t("v040Item2"),
        t("v040Item3"),
        t("v040Item4"),
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

      <div className="flex flex-col gap-10">
        {releases.map((rel) => (
          <article key={rel.version}>
            <header className="mb-4 flex items-baseline gap-3">
              <h2
                className="m-0 font-display text-2xl font-semibold tracking-[-0.02em]"
                style={{ color: "var(--color-accent)" }}
              >
                v{rel.version}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                {rel.date}
              </span>
            </header>
            <h3 className="m-0 mb-3 font-display text-lg font-semibold text-text-primary">
              {rel.title}
            </h3>
            <ul className="m-0 flex flex-col gap-2 p-0">
              {rel.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-sm text-text-secondary">
                  <span aria-hidden style={{ color: "var(--color-accent)" }}>
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
