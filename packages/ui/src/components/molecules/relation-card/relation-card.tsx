import Image from "next/image";
import Link from "next/link";
import type { RelationType } from "@miru/types";
import { cn } from "../../../utils/cn";

interface RelationCardProps {
  relationType: RelationType;
  title: string;
  coverUrl: string | null;
  format: string | null;
  year: number | null;
  slug: string | null;
  className?: string;
}

const RELATION_LABEL: Record<RelationType, string> = {
  SEQUEL: "Suite",
  PREQUEL: "Préquelle",
  SIDE_STORY: "Histoire annexe",
  SPIN_OFF: "Spin-off",
};

export function RelationCard({
  relationType,
  title,
  coverUrl,
  format,
  year,
  slug,
  className,
}: RelationCardProps) {
  const meta = [format, year?.toString()].filter(Boolean).join(" · ") || null;
  const content = (
    <article
      className={cn(
        "group flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-bg-surface",
        "transition-transform duration-200",
        slug ? "hover:-translate-y-0.5" : "opacity-60",
        className,
      )}
    >
      <div className="relative h-20 w-full overflow-hidden bg-bg-elevated">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-bg-base/50" />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-sm bg-bg-base/70 px-1.5 py-0.5",
            "font-body text-[9px] font-medium uppercase tracking-wide text-text-secondary backdrop-blur-sm",
          )}
        >
          {RELATION_LABEL[relationType]}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <p className="truncate font-display text-xs font-semibold text-text-primary" title={title}>
          {title}
        </p>
        <p className="font-body text-[10px] text-text-tertiary">{meta ?? "—"}</p>
      </div>
    </article>
  );

  if (!slug) return content;
  return (
    <Link
      href={`/anime/${slug}`}
      className="flex min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      {content}
    </Link>
  );
}
