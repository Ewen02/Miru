import Link from "next/link";
import { Logo } from "@miru/ui";

export const metadata = {
  title: "À propos",
  description: "Miru est une plateforme anime open-source pour explorer, organiser et partager.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <Link
        href="/"
        aria-label="Accueil Miru"
        className="mb-12 inline-flex shrink-0 self-start text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <Logo size={24} />
      </Link>

      <header className="mb-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          À propos
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Miru
        </h1>
        <p className="mt-3 font-body text-lg text-text-secondary">
          Explorer, organiser, partager les animes que tu aimes.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <p className="font-body text-text-secondary">
          Miru est une plateforme qui agrège les données AniList et MyAnimeList pour t&apos;offrir
          un catalogue propre, une fiche anime complète, et une watchlist personnelle. Le projet
          est gratuit, sans publicité, et conçu pour rester rapide.
        </p>
        <p className="font-body text-text-secondary">
          Les notes que tu donnes alimentent un score communautaire calculé à partir des avis
          publiés sur la plateforme — distinct de la note AniList importée à la création.
        </p>

        <div className="mt-4 rounded-xl border border-border bg-bg-surface p-6">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Sources</h2>
          <ul className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
            <li>
              Données anime : <span className="text-text-primary">AniList</span> &amp;{" "}
              <span className="text-text-primary">Jikan / MyAnimeList</span>
            </li>
            <li>
              Liens streaming : extraits des entrées AniList officielles (Crunchyroll, Netflix,
              ADN…)
            </li>
            <li>
              Images : servies par les CDN AniList / MAL via{" "}
              <code className="font-mono text-xs">next/image</code>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
