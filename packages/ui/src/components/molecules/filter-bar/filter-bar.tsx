import type { ChangeEvent } from "react";
import { FilterChip } from "../filter-chip";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { cn } from "../../../utils/cn";

const STATUSES = ["AIRING", "FINISHED", "ANNOUNCED", "HIATUS"] as const;
const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"] as const;

interface GenreOption {
  slug: string;
  name: string;
}

interface FilterBarProps {
  status: string | null;
  format: string | null;
  year: string;
  genreSlugs: string[];
  availableGenres: GenreOption[];
  resultCount: number;
  hasActiveFilters: boolean;
  onToggleStatus: (value: string) => void;
  onToggleFormat: (value: string) => void;
  onYearChange: (value: string) => void;
  onToggleGenre: (slug: string) => void;
  onReset: () => void;
  className?: string;
}

export function FilterBar({
  status,
  format,
  year,
  genreSlugs,
  availableGenres,
  resultCount,
  hasActiveFilters,
  onToggleStatus,
  onToggleFormat,
  onYearChange,
  onToggleGenre,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <FilterGroup label="Statut">
        {STATUSES.map((s) => (
          <FilterChip key={s} label={s} active={status === s} onToggle={() => onToggleStatus(s)} />
        ))}
      </FilterGroup>

      <FilterGroup label="Format">
        {FORMATS.map((f) => (
          <FilterChip key={f} label={f} active={format === f} onToggle={() => onToggleFormat(f)} />
        ))}
      </FilterGroup>

      <FilterGroup label="Année">
        <Input
          type="number"
          min={1960}
          max={2100}
          value={year}
          placeholder="2024"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onYearChange(e.target.value)}
          className="w-28"
        />
      </FilterGroup>

      {availableGenres.length > 0 && (
        <FilterGroup label="Genres">
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((g) => (
              <FilterChip
                key={g.slug}
                label={g.name}
                active={genreSlugs.includes(g.slug)}
                onToggle={() => onToggleGenre(g.slug)}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <span className="font-mono text-xs uppercase tracking-wide text-text-tertiary">
          {resultCount} anime{resultCount > 1 ? "s" : ""}
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-16 shrink-0 font-mono text-xs uppercase tracking-wide text-text-tertiary">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
