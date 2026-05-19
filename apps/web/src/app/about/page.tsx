import Link from "next/link";
import { EditorialHero } from "@miru/ui";

export const metadata = {
  title: "À propos",
  description:
    "Miru — plateforme anime pour explorer, organiser et partager. Open source, sans pub, propulsé par AniList et MyAnimeList.",
};

export default function AboutPage() {
  return (
    <>
      <EditorialHero
        decorative
        eyebrow="À propos"
        title="Le contenu est le design."
        description="Miru est une plateforme anime conçue pour disparaître derrière les œuvres. Pas de fioritures décoratives, pas de pubs, pas de tracking — juste un catalogue propre, une fiche éditoriale par anime, et une watchlist personnelle."
      />

      <main className="mx-auto max-w-300 px-7 pb-24 pt-16">
        {/* Pillars — three editorial blocks */}
        <section className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Pillar
            eyebrow="01"
            title="Explorer"
            body="Un catalogue construit sur AniList et enrichi via Jikan. Recherche, filtres, tri par note communautaire — pas de scroll infini, pas d'autoplay."
          />
          <Pillar
            eyebrow="02"
            title="Organiser"
            body="Watchlist personnelle avec 5 statuts, progression épisode par épisode, et une note privée. Tes données t'appartiennent."
          />
          <Pillar
            eyebrow="03"
            title="Partager"
            body="Publie des avis publics, lis ceux des autres, suis ton historique. La note communautaire de chaque anime est calculée à partir des avis Miru — distincte de la note AniList importée."
          />
        </section>

        {/* Tech stack */}
        <section className="mb-20">
          <header className="mb-6 flex items-baseline justify-between">
            <h2 className="m-0 flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
              <span
                aria-hidden
                className="inline-block h-0.5 w-6 rounded-full"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
              Stack
            </h2>
          </header>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <StackItem label="Framework" value="Next.js 16" />
            <StackItem label="API" value="NestJS 11" />
            <StackItem label="DB" value="PostgreSQL + Prisma 6" />
            <StackItem label="Auth" value="BetterAuth" />
            <StackItem label="UI" value="Tailwind v4" />
            <StackItem label="Type system" value="TypeScript strict" />
            <StackItem label="Monorepo" value="Turborepo + pnpm" />
            <StackItem label="Architecture" value="Hexagonal (DDD)" />
          </div>
        </section>

        {/* Sources */}
        <section className="mb-20">
          <header className="mb-6 flex items-baseline justify-between">
            <h2 className="m-0 flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
              <span
                aria-hidden
                className="inline-block h-0.5 w-6 rounded-full"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
              Sources de données
            </h2>
          </header>
          <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <SourceRow
              label="Catalogue"
              value="AniList GraphQL"
              href="https://anilist.gitbook.io/anilist-apiv2-docs/"
            />
            <SourceRow
              label="Métadonnées étendues"
              value="Jikan (MyAnimeList)"
              href="https://docs.api.jikan.moe/"
            />
            <SourceRow label="Liens streaming" value="AniList externalLinks (filtrés type=STREAMING)" />
            <SourceRow label="Images" value="CDN AniList / MAL via next/image" />
            <SourceRow label="Accent par anime" value="Calculé côté API via sharp (extraction de teinte cover)" />
          </div>
        </section>

        {/* Closing CTA */}
        <section className="rounded-2xl border border-border-subtle bg-bg-surface px-8 py-12 text-center">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Open source
          </p>
          <h2 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.02em] text-text-primary">
            Le code est sur GitHub.
          </h2>
          <p className="mx-auto mb-6 max-w-140 font-body text-sm leading-relaxed text-text-secondary">
            Issues, PRs et suggestions bienvenues. Miru est un projet personnel
            qui grandit en public — chaque release est documentée.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/Favikon/miru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md px-4 font-body text-sm font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              Voir le repo →
            </a>
            <Link
              href="/"
              className="inline-flex h-10 items-center font-mono text-xs tracking-wider text-text-secondary uppercase transition-colors duration-200 hover:text-text-primary"
            >
              ← Catalogue
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function Pillar({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <article className="flex flex-col gap-3">
      <p
        className="m-0 font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--color-accent)" }}
      >
        {eyebrow}
      </p>
      <h3 className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {title}
      </h3>
      <p className="m-0 font-body text-sm leading-relaxed text-text-secondary text-pretty">
        {body}
      </p>
    </article>
  );
}

function StackItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface px-4 py-3">
      <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <p className="m-0 font-body text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function SourceRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm text-text-primary underline-offset-2 transition-opacity duration-200 hover:opacity-80"
        >
          {value} ↗
        </a>
      ) : (
        <span className="font-body text-sm text-text-primary">{value}</span>
      )}
    </div>
  );
}
