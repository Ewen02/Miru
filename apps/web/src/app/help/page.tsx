import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aide",
  description: "Centre d'aide Miru.",
};

const CATEGORIES = [
  {
    title: "Premiers pas",
    articles: ["Créer un compte", "Importer ta liste AniList", "Comprendre les statuts watchlist"],
  },
  {
    title: "Watchlist & notes",
    articles: ["Noter un anime", "Marquer un épisode comme vu", "Différence entre note Miru et note AniList"],
  },
  {
    title: "Profil & social",
    articles: ["Rendre ton profil public", "Suivre quelqu'un", "Bloquer un compte"],
  },
  {
    title: "Compte",
    articles: ["Changer ton e-mail", "Exporter tes données", "Supprimer ton compte"],
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Centre d'aide
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Aide
        </h1>
      </header>

      <div className="mb-10">
        <input
          type="search"
          placeholder="Cherche un article…"
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
          Pas trouvé ce que tu cherches ?
        </p>
        <a
          href="mailto:support@miru.app"
          className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          Écris-nous
        </a>
      </footer>
    </main>
  );
}
