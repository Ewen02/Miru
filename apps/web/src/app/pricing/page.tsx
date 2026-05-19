import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Miru est gratuit. Plus pour les sympathisants qui veulent soutenir.",
};

const PLANS = [
  {
    name: "Gratuit",
    price: "0 €",
    period: "à vie",
    description: "Tout l'essentiel. Pas de pub, pas de limite.",
    highlights: ["Catalogue complet", "Watchlist illimitée", "Avis publics", "Stats annuelles", "Pour-toi recommandations"],
    cta: "Commencer",
    primary: false,
  },
  {
    name: "Sympathisant",
    price: "4 €",
    period: "/ mois",
    description: "Pour soutenir le développement sans changer d'expérience.",
    highlights: [
      "Tout du gratuit",
      "Badge sur ton profil",
      "Accès aux features beta",
      "Carte de partage premium",
      "Réduction sur le merch (à venir)",
    ],
    cta: "Devenir sympathisant",
    primary: true,
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-12 text-center">
        <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Tarifs
        </p>
        <h1 className="m-0 mb-4 font-display text-5xl font-semibold tracking-[-0.03em] text-text-primary sm:text-6xl">
          Tu paies si tu veux.
        </h1>
        <p className="mx-auto m-0 max-w-160 font-body text-lg text-text-secondary">
          Miru sera toujours gratuit pour l'essentiel. L'abonnement Sympathisant
          existe pour celles et ceux qui veulent soutenir le projet — pas pour
          débloquer des features.
        </p>
      </header>

      <section className="mb-16 grid grid-cols-1 gap-5 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className="flex flex-col gap-5 rounded-2xl border bg-bg-surface p-8"
            style={{
              borderColor: plan.primary
                ? "color-mix(in srgb, var(--color-accent) 40%, var(--color-border))"
                : "var(--color-border-subtle)",
            }}
          >
            <header>
              <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                {plan.name}
              </p>
              <p className="m-0 flex items-baseline gap-2">
                <span
                  className="font-display text-5xl font-semibold tracking-[-0.025em] text-text-primary"
                  style={plan.primary ? { color: "var(--color-accent)" } : undefined}
                >
                  {plan.price}
                </span>
                <span className="font-mono text-sm text-text-tertiary">{plan.period}</span>
              </p>
              <p className="m-0 mt-3 font-body text-sm text-text-secondary">{plan.description}</p>
            </header>
            <ul className="m-0 flex flex-col gap-2 p-0">
              {plan.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 font-body text-sm text-text-secondary"
                >
                  <span
                    aria-hidden
                    style={{ color: "var(--color-accent)" }}
                  >
                    ✓
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-auto inline-flex h-11 items-center justify-center rounded-md font-body text-sm font-semibold"
              style={
                plan.primary
                  ? { backgroundColor: "var(--color-accent)", color: "#08080c" }
                  : { border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }
              }
            >
              {plan.cta}
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center">
        <h2 className="m-0 mb-3 font-display text-2xl font-semibold tracking-tight text-text-primary">
          Aucun verrou, aucune feature payante.
        </h2>
        <p className="mx-auto m-0 max-w-140 font-body text-sm text-text-secondary">
          Le plan Sympathisant ne donne accès à rien que la version gratuite n'ait — c'est une
          contribution, pas un paywall. Si tu hésites, reste sur le gratuit, tout va bien.
        </p>
      </section>
    </main>
  );
}
