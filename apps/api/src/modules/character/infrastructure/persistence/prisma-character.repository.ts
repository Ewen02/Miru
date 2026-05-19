import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { CharacterEntity } from "../../domain/entities/character.entity";
import {
  CharacterAppearance,
  CharacterRepositoryPort,
  CharacterVoiceCredit,
} from "../../domain/ports/character-repository.port";

const NSFW_HENTAI = "hentai";

@Injectable()
export class PrismaCharacterRepository implements CharacterRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CharacterEntity | null> {
    const record = await this.prisma.character.findUnique({ where: { id } });
    if (!record) return null;
    return CharacterEntity.create(record.id, {
      name: record.name,
      nameJp: record.nameJp,
      imageUrl: record.imageUrl,
    });
  }

  async appearancesByCharacterId(characterId: string): Promise<CharacterAppearance[]> {
    const rows = await this.prisma.animeCharacter.findMany({
      where: {
        characterId,
        anime: { genres: { none: { slug: NSFW_HENTAI } } },
      },
      include: {
        anime: {
          select: {
            id: true,
            slug: true,
            title: true,
            year: true,
            coverUrl: true,
            episodeCount: true,
          },
        },
      },
      orderBy: [{ anime: { year: "desc" } }, { order: "asc" }],
    });

    return rows.map((r) => ({
      animeId: r.anime.id,
      animeSlug: r.anime.slug,
      animeTitle: r.anime.title,
      animeYear: r.anime.year,
      animeCoverUrl: r.anime.coverUrl,
      animeEpisodeCount: r.anime.episodeCount,
      role: r.role,
    }));
  }

  async voiceCreditsByCharacterId(characterId: string): Promise<CharacterVoiceCredit[]> {
    const rows = await this.prisma.animeCharacter.groupBy({
      by: ["voiceActorId"],
      where: { characterId, voiceActorId: { not: null } },
      _count: { _all: true },
    });

    const ids = rows.map((r) => r.voiceActorId!).filter(Boolean);
    if (ids.length === 0) return [];

    const voiceActors = await this.prisma.voiceActor.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    const byId = new Map(voiceActors.map((v) => [v.id, v.name]));

    return rows
      .filter((r) => r.voiceActorId && byId.has(r.voiceActorId))
      .map((r) => ({
        voiceActorId: r.voiceActorId!,
        voiceActorName: byId.get(r.voiceActorId!) ?? "—",
        appearances: r._count._all,
      }))
      .sort((a, b) => b.appearances - a.appearances);
  }
}
