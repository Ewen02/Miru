import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions",
  description: "Conditions générales d'utilisation et politique de confidentialité Miru.",
};

const SECTIONS = [
  { key: "terms", label: "CGU" },
  { key: "privacy", label: "Confidentialité" },
  { key: "cookies", label: "Cookies" },
  { key: "licences", label: "Licences" },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Légal
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Conditions d'utilisation
        </h1>
        <p className="m-0 mt-2 font-body text-sm text-text-secondary">
          Dernière mise à jour : 19 mai 2026
        </p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2" aria-label="Sections légales">
        {SECTIONS.map((s, i) => (
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
        <Section id="terms" title="Conditions générales">
          Miru est un service personnel et gratuit. En l'utilisant, tu acceptes de ne pas chercher
          à le saturer (rate-limit raisonnable), ne pas l'utiliser pour scraper le catalogue, et
          ne pas y publier de contenu illégal, harcèlement ou spam.
          Tes données te restent : tu peux les exporter à tout moment, et la suppression de ton compte
          efface tout dans les 30 jours suivants.
        </Section>
        <Section id="privacy" title="Confidentialité">
          On collecte le strict minimum : email (pour le login), pseudo, et les actions que tu choisis
          de publier (avis, watchlist publique). Pas de pixel tiers, pas d'analytics third-party, pas
          de revente de données. Les logs serveur sont anonymisés après 7 jours.
        </Section>
        <Section id="cookies" title="Cookies">
          Un seul cookie de session (httpOnly, Secure, SameSite=Lax) pour te garder connecté·e.
          Aucun cookie marketing ou analytics.
        </Section>
        <Section id="licences" title="Licences & crédits">
          Données du catalogue fournies par AniList (CC BY-SA 4.0) et MyAnimeList via Jikan
          (utilisation respectueuse de leurs rate-limits). Polices Clash Display & General Sans
          (Fontshare, OFL), JetBrains Mono (OFL). Code Miru sous licence MIT.
        </Section>
      </article>

      <footer className="mt-12 border-t border-border-subtle pt-6 text-center">
        <p className="m-0 font-body text-sm text-text-secondary">
          Une question ?{" "}
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
