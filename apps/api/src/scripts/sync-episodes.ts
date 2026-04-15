import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ImportEpisodesUseCase } from "../modules/sync/application/use-cases/import-episodes.use-case";

async function main() {
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "warn", "error"],
  });

  try {
    const useCase = app.get(ImportEpisodesUseCase);
    const result = await useCase.execute({ limit });
    console.log(
      `✓ Episodes sync done: ${result.episodesImported} episode(s) across ${result.animesProcessed} anime (skipped ${result.skipped})`,
    );
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error("✗ Sync failed:", err);
  process.exit(1);
});
