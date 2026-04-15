import { cn } from "../../../utils/cn";

interface EpisodeRowProps {
  number: number;
  title: string | null;
  duration: number | null;
  airedAt: Date | string | null;
  className?: string;
}

function formatDate(value: Date | string | null): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EpisodeRow({
  number,
  title,
  duration,
  airedAt,
  className,
}: EpisodeRowProps) {
  const airedLabel = formatDate(airedAt);

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-md border border-border-subtle bg-bg-surface px-4 py-3",
        "transition-colors duration-200 hover:border-border hover:bg-bg-elevated",
        className,
      )}
    >
      <span className="w-10 shrink-0 font-mono text-sm text-text-tertiary">
        {String(number).padStart(2, "0")}
      </span>
      <span className="flex-1 truncate font-body text-sm text-text-primary">
        {title ?? <span className="text-text-tertiary">Épisode {number}</span>}
      </span>
      <span className="hidden shrink-0 font-mono text-xs text-text-tertiary sm:inline">
        {duration != null ? `${duration} min` : "—"}
      </span>
      <span className="hidden w-28 shrink-0 text-right font-mono text-xs text-text-tertiary md:inline">
        {airedLabel ?? ""}
      </span>
    </div>
  );
}
