import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("termsPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function TermsPage() {
  const t = await getTranslations("termsPage");

  const sections = [
    { key: "terms", label: t("tabTerms") },
    { key: "privacy", label: t("tabPrivacy") },
    { key: "cookies", label: t("tabCookies") },
    { key: "licences", label: t("tabLicenses") },
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
        <p className="m-0 mt-2 font-body text-sm text-text-secondary">
          {t("lastUpdate")}
        </p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2" aria-label={t("sectionsAria")}>
        {sections.map((s, i) => (
          <Link
            key={s.key}
            href={`#${s.key}`}
            className="inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
            style={i === 0 ? { color: "var(--color-accent)", borderColor: "color-mix(in srgb, var(--color-accent) 35%, transparent)" } : undefined}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <article className="prose-tight flex flex-col gap-10">
        <Section id="terms" title={t("termsTitle")}>{t("termsBody")}</Section>
        <Section id="privacy" title={t("privacyTitle")}>{t("privacyBody")}</Section>
        <Section id="cookies" title={t("cookiesTitle")}>{t("cookiesBody")}</Section>
        <Section id="licences" title={t("licensesTitle")}>{t("licensesBody")}</Section>
      </article>

      <footer className="mt-12 border-t border-border-subtle pt-6 text-center">
        <p className="m-0 font-body text-sm text-text-secondary">
          {t("contactPrefix")}{" "}
          <a
            href="mailto:contact@miru.app"
            className="font-medium text-text-primary underline-offset-2 hover:underline"
          >
            contact@miru.app
          </a>
        </p>
      </footer>
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <h2 className="m-0 mb-3 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {title}
      </h2>
      <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
        {children}
      </p>
    </section>
  );
}
