import { cn } from "../../../utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  /** Sub-line under the value (e.g. "depuis 2024", "+12% YoY"). */
  sub?: string | null;
  /** Optional tone — accent picks up the page accent color. */
  tone?: "default" | "accent";
  className?: string;
}

/**
 * Compact stat block: mono eyebrow label + large Display value + optional sub.
 * Used in user profile stats grid and the Year In Review hero. Sits in a card
 * shell so several can be lined up in a grid without extra wrappers.
 */
export function StatCard({ label, value, sub, tone = "default", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-bg-surface px-5 py-4",
        className,
      )}
    >
      <p className="m-0 mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <p
        className="m-0 font-display text-3xl font-semibold tracking-[-0.02em]"
        style={{
          color: tone === "accent" ? "var(--color-accent)" : "var(--color-text-primary)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="m-0 mt-1 font-mono text-[10px] text-text-tertiary">{sub}</p>
      )}
    </div>
  );
}
