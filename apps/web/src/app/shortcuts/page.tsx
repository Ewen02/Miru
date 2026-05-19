import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raccourcis",
  description: "Tous les raccourcis clavier Miru.",
};

const GROUPS = [
  {
    title: "Navigation",
    shortcuts: [
      ["⌘ K", "Ouvrir la palette de recherche"],
      ["g h", "Aller à la home"],
      ["g w", "Aller à la watchlist"],
      ["g c", "Aller au calendrier"],
      ["g t", "Aller au top 100"],
    ],
  },
  {
    title: "Sur une fiche anime",
    shortcuts: [
      ["w", "Toggle watchlist"],
      ["r", "Ouvrir le modal de note"],
      ["e", "Marquer l'épisode suivant comme vu"],
      ["←/→", "Naviguer entre épisodes"],
    ],
  },
  {
    title: "Lecture",
    shortcuts: [
      ["espace", "Play / pause"],
      ["f", "Plein écran"],
      ["m", "Mute"],
      ["j / l", "−10s / +10s"],
    ],
  },
];

export default function ShortcutsPage() {
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Power user
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Raccourcis
        </h1>
      </header>

      <div className="flex flex-col gap-10">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              {g.title}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
              {g.shortcuts.map(([key, label], i) => (
                <div
                  key={key}
                  className={
                    i === g.shortcuts.length - 1
                      ? "flex items-center justify-between p-4"
                      : "flex items-center justify-between border-b border-border-subtle p-4"
                  }
                >
                  <span className="font-body text-sm text-text-secondary">{label}</span>
                  <kbd className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-[11px] text-text-primary">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
