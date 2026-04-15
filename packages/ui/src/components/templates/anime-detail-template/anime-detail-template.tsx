import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";

interface AnimeDetailTemplateProps {
  hero: ReactNode;
  synopsis: ReactNode;
  info: ReactNode;
  episodes: ReactNode;
  characters?: ReactNode;
  back?: ReactNode;
  className?: string;
}

export function AnimeDetailTemplate({
  hero,
  synopsis,
  info,
  episodes,
  characters,
  back,
  className,
}: AnimeDetailTemplateProps) {
  return (
    <main className={cn("flex flex-col gap-14 pb-24", className)}>
      {back && (
        <div className="mx-auto w-full max-w-300 px-6 pt-6">{back}</div>
      )}

      {hero}

      <section className="mx-auto grid w-full max-w-300 gap-10 px-6 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-sm uppercase tracking-wide text-text-tertiary">
            Synopsis
          </h2>
          <div className="max-w-[720px] font-body text-sm leading-relaxed text-text-secondary">
            {synopsis}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <h2 className="font-display text-sm uppercase tracking-wide text-text-tertiary">
            Infos
          </h2>
          <div className="flex flex-col gap-2">{info}</div>
        </aside>
      </section>

      {characters && (
        <section className="mx-auto flex w-full max-w-300 flex-col gap-4 px-6">
          <h2 className="font-display text-sm uppercase tracking-wide text-text-tertiary">
            Personnages
          </h2>
          {characters}
        </section>
      )}

      <section className="mx-auto flex w-full max-w-300 flex-col gap-4 px-6">
        <h2 className="font-display text-sm uppercase tracking-wide text-text-tertiary">
          Épisodes
        </h2>
        <div className="flex flex-col gap-2">{episodes}</div>
      </section>
    </main>
  );
}
