"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo, cn } from "@miru/ui";

const STEPS = ["Import", "Favoris", "Genres"] as const;
const TOTAL_STEPS = STEPS.length;

const SERVICES = [
  { id: "anilist", name: "AniList", connected: true },
  { id: "mal", name: "MyAnimeList", connected: false },
  { id: "kitsu", name: "Kitsu", connected: false },
];

const STARTER_PICKS = Array.from({ length: 12 }, (_, i) => ({
  id: `pick-${i}`,
  title: ["Frieren", "Solo Leveling", "Vinland Saga", "Mushishi", "Cowboy Bebop", "Made in Abyss", "Chainsaw Man", "Demon Slayer", "Spy x Family", "Jujutsu Kaisen", "Attack on Titan", "Bocchi the Rock"][i],
}));

const GENRE_OPTIONS = [
  "Slice of life", "Drame", "Romance", "Action", "Aventure", "Fantastique",
  "Sci-fi", "Mystère", "Psychologique", "Thriller", "Comédie", "Sport",
  "Music", "Horror", "Mecha", "Historique", "Surnaturel", "Spaghetti western",
];

export default function OnboardPage() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [genres, setGenres] = useState<Set<string>>(
    new Set(["Slice of life", "Drame", "Romance", "Sci-fi", "Mystère", "Fantastique"]),
  );

  const togglePick = (id: string) => {
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGenre = (g: string) => {
    setGenres((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const canAdvance = step === 0 || (step === 1 && picks.size >= 3) || (step === 2);
  const isFinal = step === TOTAL_STEPS - 1;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" aria-label="Accueil" className="text-text-primary">
          <Logo size={20} />
        </Link>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          Plus tard
        </Link>
      </header>

      {/* Progress bar */}
      <div className="mb-10 h-1 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{
            width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
      </div>

      <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        Étape {step + 1} / {TOTAL_STEPS} · {STEPS[step]}
      </p>

      {step === 0 && (
        <section className="mb-12">
          <h1 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            On part de zéro ou on importe ta liste ?
          </h1>
          <p className="m-0 mb-8 font-body text-base text-text-secondary">
            Bienvenue. Importe tes données depuis un service connecté, ou pars d'une feuille blanche.
          </p>
          <div className="flex flex-col gap-3">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={cn(
                  "flex items-center justify-between rounded-xl border px-5 py-4 text-left",
                  "transition-colors duration-150",
                  s.connected
                    ? "border-accent/40 bg-accent/10"
                    : "border-border bg-bg-surface hover:bg-bg-elevated",
                )}
              >
                <span className="font-body text-base font-medium text-text-primary">
                  {s.name}
                </span>
                {s.connected ? (
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--color-accent)" }}
                  >
                    ● Connecté
                  </span>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    Connecter
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="mb-12">
          <h1 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            Choisis 3 favoris pour démarrer
          </h1>
          <p className="m-0 mb-8 font-body text-base text-text-secondary">
            Ça calibre les recommandations dès le premier jour.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {STARTER_PICKS.map((p, idx) => {
              const selected = picks.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePick(p.id)}
                  className={cn(
                    "group relative aspect-3/4 overflow-hidden rounded-xl border-2 text-left",
                    selected ? "border-accent" : "border-border-subtle",
                  )}
                  style={{
                    background: `linear-gradient(${140 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${15 + idx * 4}%, transparent), var(--color-bg-elevated))`,
                  }}
                >
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
                    >
                      ✓
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-base/90 to-transparent p-2 text-xs font-medium text-text-primary">
                    {p.title}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 font-mono text-xs text-text-tertiary">
            {picks.size} sélectionné{picks.size > 1 ? "s" : ""} · 3 minimum requis
          </p>
        </section>
      )}

      {step === 2 && (
        <section className="mb-12">
          <h1 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            Quels genres t'intéressent ?
          </h1>
          <p className="m-0 mb-8 font-body text-base text-text-secondary">
            On filtre les reco. Tu pourras les changer plus tard depuis ton profil.
          </p>
          <div className="mb-8 flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => {
              const active = genres.has(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border px-3 font-body text-sm transition-colors duration-150",
                    active
                      ? "border-accent/40 bg-accent/15"
                      : "border-border bg-bg-surface text-text-secondary hover:text-text-primary",
                  )}
                  style={active ? { color: "var(--color-accent)" } : undefined}
                >
                  {g}
                </button>
              );
            })}
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-surface p-4">
            <input type="checkbox" className="mt-1 accent-(--color-accent)" />
            <div>
              <p className="m-0 font-body text-sm font-medium text-text-primary">
                Inclure les anime déconseillés aux mineurs
              </p>
              <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
                Pas de NSFW dans Miru. Cette option couvre uniquement les titres avec scènes de violence graphique ou contenus sensibles.
              </p>
            </div>
          </label>
        </section>
      )}

      <footer className="mt-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-xs uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary disabled:opacity-40"
        >
          ← Précédent
        </button>
        {isFinal ? (
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md px-5 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Terminer →
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => canAdvance && setStep((s) => s + 1)}
            disabled={!canAdvance}
            className="inline-flex h-10 items-center rounded-md px-5 font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Suivant →
          </button>
        )}
      </footer>
    </main>
  );
}
