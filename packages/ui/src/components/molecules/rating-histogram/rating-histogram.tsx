import { cn } from "../../../utils/cn";

interface RatingHistogramProps {
  /** Bin counts from rating 1 to 10 (length 10). Tolerates shorter arrays by padding with zeros. */
  bins: readonly number[];
  /** Show the count above the tallest bar. Defaults to true. */
  showTotal?: boolean;
  className?: string;
}

/**
 * 10-bin rating distribution. Bars are scaled relative to the tallest, so
 * the shape stays readable regardless of total vote count.
 *
 * Heights: 96px max, 6px floor so empty bins still register as ticks.
 */
export function RatingHistogram({
  bins,
  showTotal = true,
  className,
}: RatingHistogramProps) {
  const padded = Array.from({ length: 10 }, (_, i) => bins[i] ?? 0);
  const max = Math.max(...padded, 1);
  const total = padded.reduce((acc, n) => acc + n, 0);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-24 items-end gap-1.5">
        {padded.map((count, idx) => {
          const heightPct = (count / max) * 100;
          return (
            <div key={idx} className="flex flex-1 flex-col justify-end">
              <div
                className="w-full rounded-sm transition-[height] duration-300"
                style={{
                  height: `max(6px, ${heightPct}%)`,
                  backgroundColor:
                    count === max && count > 0
                      ? "var(--color-accent)"
                      : "color-mix(in srgb, var(--color-accent) 30%, transparent)",
                }}
                aria-label={`${count} note${count > 1 ? "s" : ""} de ${idx + 1}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-[9px] text-text-quaternary">
        {[1, 3, 5, 7, 10].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      {showTotal && (
        <p className="m-0 font-mono text-[10px] text-text-tertiary">
          {total.toLocaleString("fr-FR")} note{total > 1 ? "s" : ""} au total
        </p>
      )}
    </div>
  );
}
