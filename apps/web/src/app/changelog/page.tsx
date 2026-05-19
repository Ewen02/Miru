import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Toutes les mises à jour de Miru.",
};

const RELEASES = [
  {
    version: "0.5.0",
    date: "19 mai 2026",
    title: "Pages éditoriales & système de découverte",
    items: [
      "Nouvelle page /genre/[slug] avec stats et description curée",
      "Page profil public /u/[handle] avec histogram",
      "Refonte éditoriale de /about",
      "Calendar /calendar, Top /top, Saisons /seasons/[year]",
      "Foundation modals (ModalShell, Toast)",
    ],
  },
  {
    version: "0.4.2",
    date: "12 mai 2026",
    title: "Anti-spam AniList & filtre NSFW",
    items: [
      "Circuit breaker AniList — fin du spam de logs lors d'outages",
      "Filtre Hentai (3 couches : GraphQL, adapter, repo)",
      "Sticky-header anime detail avec swap au scroll",
    ],
  },
  {
    version: "0.4.0",
    date: "5 mai 2026",
    title: "Design system Claude Design + auth",
    items: [
      "Implémentation du design Claude (Phase E1-E7)",
      "Auth BetterAuth complet (signup, login, session)",
      "Reviews avec slider 1-10 et spoiler toggle",
      "Watchlist avec stepper d'épisode et mini-slider de note",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Releases
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Changelog
        </h1>
      </header>

      <div className="flex flex-col gap-10">
        {RELEASES.map((rel) => (
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
