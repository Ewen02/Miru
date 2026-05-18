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

function roleBadge(role: string): string {
  switch (role) {
    case "MAIN":
      return "MAIN";
    case "SUPPORTING":
      return "SUPP";
    default:
      return "BG";
  }
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
    <article className={cn("group w-char-card-w shrink-0", className)}>
      <div
        className={cn(
          "relative mb-2 h-char-card-h w-char-card-w overflow-hidden rounded-lg border border-border bg-bg-elevated",
          "transition-transform duration-200 ease-out group-hover:-translate-y-0.5",
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="100px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary">
            <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
            </svg>
          </div>
        )}
        <span
          className={cn(
            "absolute right-1.5 top-1.5 rounded-sm bg-black/50 px-1.5 py-0.5",
            "font-body text-[8px] font-medium uppercase tracking-wide text-white/70 backdrop-blur-sm",
          )}
        >
          {roleBadge(role)}
        </span>
      </div>
      <p
        className="mb-0.5 truncate font-display text-xs font-semibold text-text-primary"
        title={name}
      >
        {name}
      </p>
      {nameJp && (
        <p className="truncate font-body text-[10px] text-text-tertiary" title={nameJp}>
          {nameJp}
        </p>
      )}
      {voiceActor && (
        <p className="truncate font-body text-[10px] text-text-tertiary" title={voiceActor}>
          {voiceActor}
        </p>
      )}
    </article>
  );
}
