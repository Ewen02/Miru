import { Injectable } from "@nestjs/common";
import { WatchStatus } from "@miru/types";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { WatchlistEntryEntity } from "../../domain/entities/watchlist-entry.entity";
import {
  WatchlistEntryWithAnime,
  WatchlistRepositoryPort,
} from "../../domain/ports/watchlist-repository.port";

@Injectable()
export class PrismaWatchlistRepository implements WatchlistRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string, animeId: string): Promise<WatchlistEntryEntity | null> {
    const record = await this.prisma.watchlistEntry.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (!record) return null;
    return toEntity(record);
  }

  async findByUser(userId: string, status?: WatchStatus): Promise<WatchlistEntryWithAnime[]> {
    const records = await this.prisma.watchlistEntry.findMany({
      where: { userId, status: status ?? undefined },
      orderBy: { updatedAt: "desc" },
      include: {
        anime: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            accentHex: true,
            episodeCount: true,
          },
        },
      },
    });
    return records.map((r) => ({
      entry: toEntity(r),
      anime: r.anime,
    }));
  }

  async save(entry: WatchlistEntryEntity): Promise<void> {
    const snap = entry.toSnapshot();
    await this.prisma.watchlistEntry.upsert({
      where: { userId_animeId: { userId: snap.userId, animeId: snap.animeId } },
      create: snap,
      update: {
        status: snap.status,
        currentEpisode: snap.currentEpisode,
        rating: snap.rating,
        isFavorite: snap.isFavorite,
        startedAt: snap.startedAt,
        completedAt: snap.completedAt,
      },
    });
  }

  async remove(userId: string, animeId: string): Promise<void> {
    await this.prisma.watchlistEntry.deleteMany({ where: { userId, animeId } });
  }

  async markEpisodeWatched(userId: string, episodeId: string): Promise<void> {
    // Upsert is idempotent: re-marking is a no-op, original watchedAt stays.
    await this.prisma.userEpisode.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: { userId, episodeId },
      update: {},
    });
  }

  async unmarkEpisodeWatched(userId: string, episodeId: string): Promise<void> {
    await this.prisma.userEpisode.deleteMany({ where: { userId, episodeId } });
  }

  async listWatchedEpisodes(
    userId: string,
    animeId: string,
  ): Promise<{ episodeId: string; episodeNumber: number; watchedAt: Date }[]> {
    const rows = await this.prisma.userEpisode.findMany({
      where: { userId, episode: { animeId } },
      orderBy: { watchedAt: "desc" },
      include: { episode: { select: { number: true } } },
    });
    return rows.map((r) => ({
      episodeId: r.episodeId,
      episodeNumber: r.episode.number,
      watchedAt: r.watchedAt,
    }));
  }
}

interface WatchlistRow {
  userId: string;
  animeId: string;
  status: string;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

function toEntity(record: WatchlistRow): WatchlistEntryEntity {
  return WatchlistEntryEntity.create({
    userId: record.userId,
    animeId: record.animeId,
    status: record.status as WatchStatus,
    currentEpisode: record.currentEpisode,
    rating: record.rating,
    isFavorite: record.isFavorite,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
  });
}
