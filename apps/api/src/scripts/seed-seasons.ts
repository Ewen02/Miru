import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ImportBySeasonUseCase } from "../modules/sync/application/use-cases/import-by-season.use-case";
import type { MediaSeason } from "../modules/anime/domain/ports/anime-sync.port";

const ALL_SEASONS: readonly MediaSeason[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

function parseArg(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found?.slice(prefix.length);
}

function parseYears(): number[] {
  const raw = parseArg("years") ?? process.env.YEARS;
  if (raw) {
    return raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 1960);
  }
  return [2022, 2023, 2024, 2025, 2026];
}

function parseSeasons(): MediaSeason[] {
  const raw = parseArg("seasons") ?? process.env.SEASONS;
  if (!raw) return [...ALL_SEASONS];
  const allowed = new Set<string>(ALL_SEASONS);
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is MediaSeason => allowed.has(s));
}

async function main() {
  const years = parseYears();
  const seasons = parseSeasons();
  const pages = Number(parseArg("pages") ?? process.env.PAGES ?? 2);
  const perPage = Number(parseArg("perPage") ?? process.env.PER_PAGE ?? 50);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "warn", "error"],
  });

  try {
    const useCase = app.get(ImportBySeasonUseCase);
    let totalImported = 0;
    let totalPages = 0;

    for (const year of years) {
      for (const season of seasons) {
        const result = await useCase.execute({ season, seasonYear: year, pages, perPage });
        totalImported += result.imported;
        totalPages += result.pagesFetched;
      }
    }

    console.log(
      `✓ Seed done: ${totalImported} anime imported across ${totalPages} page(s) ` +
        `(${years.length} year(s) × ${seasons.length} season(s), pages=${pages}, perPage=${perPage})`,
    );
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
