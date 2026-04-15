import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ImportTrendingUseCase } from "../modules/sync/application/use-cases/import-trending.use-case";

async function main() {
  const pages = Number(process.env.PAGES ?? 3);
  const perPage = Number(process.env.PER_PAGE ?? 20);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "warn", "error"],
  });

  try {
    const useCase = app.get(ImportTrendingUseCase);
    const result = await useCase.execute({ pages, perPage });
    console.log(`✓ Imported ${result.imported} anime across ${result.pagesFetched} page(s)`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error("✗ Sync failed:", err);
  process.exit(1);
});
