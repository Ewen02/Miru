import Image from "next/image";
import { cn } from "../../../utils/cn";

interface PlatformBadgeProps {
  name: string;
  url: string;
  iconUrl: string | null;
  color: string | null;
  className?: string;
}

/**
 * Lien externe vers une plateforme de streaming. La couleur est utilisée pour
 * teinter la bordure au hover sans renoncer aux tokens neutres par défaut.
 */
export function PlatformBadge({ name, url, iconUrl, color, className }: PlatformBadgeProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Regarder sur ${name}`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-2",
        "transition-colors duration-200 hover:bg-bg-elevated hover:border-(--platform-color,var(--color-border))",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
      style={color ? ({ "--platform-color": color } as React.CSSProperties) : undefined}
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={16}
          height={16}
          unoptimized
          className="h-4 w-4 shrink-0"
        />
      ) : (
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-sm"
          style={{ backgroundColor: color ?? "var(--color-text-tertiary)" }}
        />
      )}
      <span className="font-body text-xs font-medium text-text-primary">{name}</span>
    </a>
  );
}
