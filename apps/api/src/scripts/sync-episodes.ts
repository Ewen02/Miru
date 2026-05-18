import { ImportEpisodesUseCase } from "../modules/sync/application/use-cases/import-episodes.use-case";
import { runWithContext } from "./run-with-context";

const limit = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const airingOnly = process.env.AIRING_ONLY === "true";

void runWithContext("Sync episodes", async (app) => {
  const useCase = app.get(ImportEpisodesUseCase);
  const result = await useCase.execute({ limit, airingOnly });
  console.log(
    `✓ Episodes sync done: ${result.episodesImported} episode(s) across ${result.animesProcessed} anime (skipped ${result.skipped})`,
  );
});
