import { cn } from "../../../utils/cn";

interface SectionHeaderProps {
  label: string;
  count?: number | string | null;
  className?: string;
}

export function SectionHeader({ label, count, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-3.5 flex items-baseline justify-between px-5", className)}>
      <h2 className="m-0 flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
        <span
          aria-hidden
          className="inline-block h-[2px] w-6 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
        {label}
      </h2>
      {count != null && <span className="font-mono text-[11px] text-text-tertiary">{count}</span>}
    </div>
  );
}
