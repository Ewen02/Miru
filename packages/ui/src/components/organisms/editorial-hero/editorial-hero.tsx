import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface EditorialHeroProps {
  /** Mono uppercase eyebrow (e.g. "Genre", "Studio", "À propos"). */
  eyebrow: string;
  /** Giant Display title. */
  title: string;
  /** Optional intro paragraph under the title (max-w-160 enforced). */
  description?: string;
  /** Breadcrumb chain rendered above the eyebrow. */
  breadcrumbs?: BreadcrumbItem[];
  /** Right-aligned content (stats sidebar, action button). */
  aside?: ReactNode;
  /** Show the decorative radial-accent glow in the top-right corner. */
  decorative?: boolean;
  className?: string;
}

/**
 * The "editorial" page hero pattern repeated on /genre/[slug], /studios/[slug],
 * /about, /people/[id]. Eyebrow + giant title + optional paragraph, with an
 * optional aside slot for stats or actions.
 *
 * Decorative radial gradient picks up the current page accent (so it tints
 * itself automatically when wrapped in an `--accent-override` scope).
 */
export function EditorialHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  aside,
  decorative = false,
  className,
}: EditorialHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border-subtle",
        className,
      )}
    >
      {decorative && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-25 -top-12 h-150 w-150 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 60%)",
          }}
        />
      )}
      <div className="mx-auto max-w-300 px-7 pb-12 pt-14">
        <div className="flex flex-wrap items-end gap-x-14 gap-y-6">
          <div className="min-w-0 flex-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-4 flex flex-wrap items-center gap-2" aria-label="Fil d'Ariane">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.href} className="flex items-center gap-2">
                    <Link
                      href={crumb.href}
                      className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
                    >
                      {idx === 0 ? `← ${crumb.label}` : crumb.label}
                    </Link>
                    {idx < breadcrumbs.length - 1 && (
                      <span className="text-text-quaternary">/</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              {eyebrow}
            </p>
            <h1 className="m-0 mb-5 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            {description && (
              <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
                {description}
              </p>
            )}
          </div>

          {aside && <div className="flex shrink-0 items-end gap-8 pb-2">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
