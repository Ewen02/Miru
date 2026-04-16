"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GenreCard } from "@miru/types";
import { FilterBar } from "../../molecules/filter-bar";
import { SearchInput } from "../../molecules/search-input";

interface CatalogToolbarProps {
  availableGenres: GenreCard[];
  resultCount: number;
}

export function CatalogToolbar({ availableGenres, resultCount }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") ?? "");

  const status = searchParams.get("status");
  const format = searchParams.get("format");
  const year = searchParams.get("year") ?? "";
  const genreSlugs = searchParams.getAll("genres");

  const hasActiveFilters =
    searchDraft.length > 0 ||
    status != null ||
    format != null ||
    year.length > 0 ||
    genreSlugs.length > 0;

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (searchDraft === current) return;
    const id = setTimeout(() => {
      pushSearch(searchDraft);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  function buildHref(patch: Record<string, string | string[] | null>): string {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      next.delete(key);
      if (Array.isArray(value)) {
        for (const v of value) next.append(key, v);
      } else if (value != null && value !== "") {
        next.set(key, value);
      }
    }
    next.delete("page");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(patch: Record<string, string | string[] | null>) {
    startTransition(() => router.replace(buildHref(patch), { scroll: false }));
  }

  function pushSearch(value: string) {
    navigate({ search: value.length > 0 ? value : null });
  }

  function toggleStatus(value: string) {
    navigate({ status: status === value ? null : value });
  }

  function toggleFormat(value: string) {
    navigate({ format: format === value ? null : value });
  }

  function onYearChange(value: string) {
    navigate({ year: value });
  }

  function toggleGenre(slug: string) {
    const next = genreSlugs.includes(slug)
      ? genreSlugs.filter((s) => s !== slug)
      : [...genreSlugs, slug];
    navigate({ genres: next });
  }

  function reset() {
    setSearchDraft("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchInput
        value={searchDraft}
        onChange={setSearchDraft}
        placeholder="Rechercher un anime…"
      />
      <FilterBar
        status={status}
        format={format}
        year={year}
        genreSlugs={genreSlugs}
        availableGenres={availableGenres}
        resultCount={resultCount}
        hasActiveFilters={hasActiveFilters}
        onToggleStatus={toggleStatus}
        onToggleFormat={toggleFormat}
        onYearChange={onYearChange}
        onToggleGenre={toggleGenre}
        onReset={reset}
      />
    </div>
  );
}
