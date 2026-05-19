import { cn } from "../../../utils/cn";

export type ToastTone = "success" | "info" | "warn" | "error";

interface ToastProps {
  tone: ToastTone;
  title: string;
  subtitle?: string;
  /** Optional CTA right-aligned (e.g. "Annuler", "Voir"). */
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  className?: string;
}

const TONE_COLORS: Record<ToastTone, string> = {
  success: "var(--color-success)",
  info: "var(--color-accent)",
  warn: "var(--color-warning)",
  error: "var(--color-error)",
};

/**
 * Notification card with a colored left stripe. Stateless — the toast queue
 * is the consumer's responsibility (this component just renders).
 */
export function Toast({ tone, title, subtitle, action, onClose, className }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative flex items-start gap-3 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface pl-4 pr-3 py-3",
        "w-80 max-w-full shadow-xl",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: TONE_COLORS[tone] }}
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 font-body text-sm font-semibold text-text-primary">{title}</p>
        {subtitle && (
          <p className="m-0 mt-0.5 font-body text-xs text-text-secondary">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:text-text-primary"
        >
          {action.label}
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="shrink-0 text-text-tertiary transition-colors duration-200 hover:text-text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
