import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AnimeModule } from "@modules/anime/anime.module";
import { AddToWatchlistUseCase } from "./application/use-cases/add-to-watchlist.use-case";
import { GetUserWatchlistUseCase } from "./application/use-cases/get-user-watchlist.use-case";
import { ImportAniListWatchlistUseCase } from "./application/use-cases/import-anilist-watchlist.use-case";
import { RemoveFromWatchlistUseCase } from "./application/use-cases/remove-from-watchlist.use-case";
import { UpdateWatchlistEntryUseCase } from "./application/use-cases/update-watchlist-entry.use-case";
import { WATCHLIST_REPOSITORY } from "./application/tokens";
import { PrismaWatchlistRepository } from "./infrastructure/persistence/prisma-watchlist.repository";
import { WatchlistController } from "./infrastructure/http/watchlist.controller";

@Module({
  imports: [PrismaModule, AnimeModule],
  controllers: [WatchlistController],
  providers: [
    AddToWatchlistUseCase,
    UpdateWatchlistEntryUseCase,
    RemoveFromWatchlistUseCase,
    GetUserWatchlistUseCase,
    ImportAniListWatchlistUseCase,
    { provide: WATCHLIST_REPOSITORY, useClass: PrismaWatchlistRepository },
  ],
  exports: [WATCHLIST_REPOSITORY],
})
export class WatchlistModule {}
