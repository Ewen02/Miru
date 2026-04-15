import { cn } from "../../../utils/cn";

interface FilterChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  className?: string;
}

export function FilterChip({ label, active, onToggle, className }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-1 font-mono text-xs uppercase tracking-wide",
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        active
          ? "border-accent/40 bg-accent-muted text-text-primary"
          : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border hover:text-text-primary",
        className,
      )}
    >
      {label}
    </button>
  );
}
