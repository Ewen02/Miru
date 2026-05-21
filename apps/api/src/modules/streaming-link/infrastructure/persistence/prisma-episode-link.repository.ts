import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  EpisodeLinkRepositoryPort,
  UpsertEpisodeLinkInput,
} from "../../domain/ports/episode-link-repository.port";
import {
  EpisodeLinkSource,
  EpisodePlatformLinkEntity,
} from "../../domain/entities/episode-platform-link.entity";

function mapRow(row: {
  id: string;
  episodeId: string;
  source: string;
  url: string;
  verifiedAt: Date;
  brokenAt: Date | null;
  createdAt: Date;
}): EpisodePlatformLinkEntity {
  return {
    id: row.id,
    episodeId: row.episodeId,
    source: row.source as EpisodeLinkSource,
    url: row.url,
    verifiedAt: row.verifiedAt,
    brokenAt: row.brokenAt,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class PrismaEpisodeLinkRepository implements EpisodeLinkRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(input: UpsertEpisodeLinkInput): Promise<EpisodePlatformLinkEntity> {
    const row = await this.prisma.episodePlatformLink.upsert({
      where: { episodeId_source: { episodeId: input.episodeId, source: input.source } },
      create: {
        episodeId: input.episodeId,
        source: input.source,
        url: input.url,
      },
      update: {
        url: input.url,
        verifiedAt: new Date(),
        brokenAt: null,
      },
    });
    return mapRow(row);
  }

  async findByEpisodeId(episodeId: string): Promise<EpisodePlatformLinkEntity[]> {
    const rows = await this.prisma.episodePlatformLink.findMany({
      where: { episodeId, brokenAt: null },
      orderBy: { source: "asc" },
    });
    return rows.map(mapRow);
  }

  async findStale(olderThan: Date, limit: number): Promise<EpisodePlatformLinkEntity[]> {
    const rows = await this.prisma.episodePlatformLink.findMany({
      where: { verifiedAt: { lt: olderThan }, brokenAt: null },
      orderBy: { verifiedAt: "asc" },
      take: limit,
    });
    return rows.map(mapRow);
  }

  async markBroken(id: string): Promise<void> {
    await this.prisma.episodePlatformLink.update({
      where: { id },
      data: { brokenAt: new Date() },
    });
  }

  async markVerified(id: string): Promise<void> {
    await this.prisma.episodePlatformLink.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });
  }
}
