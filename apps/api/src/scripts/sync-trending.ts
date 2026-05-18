import { ImportTrendingUseCase } from "../modules/sync/application/use-cases/import-trending.use-case";
import { runWithContext } from "./run-with-context";

const pages = Number(process.env.PAGES ?? 3);
const perPage = Number(process.env.PER_PAGE ?? 20);

void runWithContext("Sync trending", async (app) => {
  const useCase = app.get(ImportTrendingUseCase);
  const result = await useCase.execute({ pages, perPage });
  console.log(`✓ Imported ${result.imported} anime across ${result.pagesFetched} page(s)`);
});
