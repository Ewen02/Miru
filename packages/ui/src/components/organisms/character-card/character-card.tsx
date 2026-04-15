import Image from "next/image";
import { cn } from "../../../utils/cn";

interface CharacterCardProps {
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  role: string;
  voiceActor: string | null;
  className?: string;
}

export function CharacterCard({
  name,
  nameJp,
  imageUrl,
  role,
  voiceActor,
  className,
}: CharacterCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-surface",
        "transition-colors duration-200 hover:border-border",
        className,
      )}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-bg-elevated">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary">
            <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
            </svg>
          </div>
        )}
        <span
          className={cn(
            "absolute left-2 top-2 rounded-sm bg-bg-base/70 px-1.5 py-0.5",
            "font-mono text-[10px] uppercase tracking-wide text-text-secondary backdrop-blur-sm",
          )}
        >
          {role}
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="truncate font-body text-sm text-text-primary">{name}</p>
        {nameJp && <p className="truncate font-body text-xs text-text-tertiary">{nameJp}</p>}
        {voiceActor && (
          <p className="mt-1 truncate font-mono text-xs text-text-tertiary">CV · {voiceActor}</p>
        )}
      </div>
    </article>
  );
}
