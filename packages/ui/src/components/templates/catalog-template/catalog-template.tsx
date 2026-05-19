import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";

interface CatalogTemplateProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  totalCount?: number | null;
  toolbar?: ReactNode;
  /** The grid of cards (or the empty/error placeholder). */
  grid: ReactNode;
  /** Pagination footer slot. */
  pagination?: ReactNode;
  /** Sections rendered above the grid (e.g. hero, sliders). */
  prelude?: ReactNode;
  className?: string;
}

export function CatalogTemplate({
  eyebrow,
  title,
  totalCount,
  toolbar,
  grid,
  pagination,
  prelude,
  className,
}: CatalogTemplateProps) {
  return (
    <>
      {prelude}
      <main className={cn("mx-auto mt-20 max-w-300 px-7 pb-20", className)}>
        <header className="mb-8">
          {eyebrow && (
            <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {title}
            {totalCount != null && (
              <span className="ml-3 font-mono text-base text-text-tertiary">{totalCount}</span>
            )}
          </h2>
        </header>

        {toolbar && <div className="mb-8">{toolbar}</div>}

        {grid}

        {pagination && <div className="mt-12">{pagination}</div>}
      </main>
    </>
  );
}
