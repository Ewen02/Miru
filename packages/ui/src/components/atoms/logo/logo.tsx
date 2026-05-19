import { cn } from "../../../utils/cn";

interface LogoProps {
  size?: number;
  /** Show the accent pip after the wordmark. Defaults to true. */
  pip?: boolean;
  className?: string;
}

/**
 * Logo Miru — wordmark "miru" + accent pip. Inspired by the Claude Design
 * reference: a lowercase Clash Display "miru" with a small square pip that
 * picks up the page accent.
 *
 * Size is the cap-height in px; the rest scales relative to it.
 */
export function Logo({ size = 20, pip = true, className }: LogoProps) {
  return (
    <span
      aria-label="Miru"
      className={cn(
        "inline-flex items-baseline gap-1.5 font-display font-semibold leading-none text-text-primary",
        className,
      )}
      style={{ fontSize: size, letterSpacing: "-0.04em" }}
    >
      <span>miru</span>
      {pip && (
        <span
          aria-hidden
          className="inline-block rounded-xs"
          style={{
            width: size * 0.32,
            height: size * 0.32,
            backgroundColor: "var(--color-accent)",
          }}
        />
      )}
    </span>
  );
}
