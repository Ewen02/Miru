import { cn } from "../../../utils/cn";

interface CoverPlaceholderProps {
  /** Drives both the gradient angle and the accent opacity step. */
  seed?: number;
  /** Tailwind aspect ratio class. Defaults to 3:4 (anime cover). */
  aspect?: string;
  className?: string;
  /** Optional content rendered on top of the gradient (rank badge, etc.). */
  children?: React.ReactNode;
}

/**
 * Decorative gradient surface used as a stand-in when no cover image is
 * available — sidesteps broken Image fallbacks and stays on-brand by picking
 * up the current accent.
 *
 * Seed shifts the gradient angle (+12°) and the accent opacity (+5%) so a
 * grid of placeholders varies visually without looking random.
 */
export function CoverPlaceholder({
  seed = 0,
  aspect = "aspect-3/4",
  className,
  children,
}: CoverPlaceholderProps) {
  const angle = 130 + (seed * 12) % 60;
  const opacity = 15 + (seed * 5) % 30;
  return (
    <div
      aria-hidden
      className={cn(aspect, "overflow-hidden rounded-xl border border-border-subtle", className)}
      style={{
        background: `linear-gradient(${angle}deg, color-mix(in srgb, var(--color-accent) ${opacity}%, transparent), var(--color-bg-elevated))`,
      }}
    >
      {children}
    </div>
  );
}
