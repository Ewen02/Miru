import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { VoiceActorEntity } from "../../domain/entities/voice-actor.entity";
import {
  VoiceActorRepositoryPort,
  VoiceActorRole,
  VoiceActorStats,
} from "../../domain/ports/voice-actor-repository.port";

const NSFW_HENTAI = "hentai";

@Injectable()
export class PrismaVoiceActorRepository implements VoiceActorRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<VoiceActorEntity | null> {
    const record = await this.prisma.voiceActor.findUnique({ where: { id } });
    return record ? VoiceActorEntity.create(record.id, { name: record.name }) : null;
  }

  async rolesByVoiceActorId(voiceActorId: string): Promise<VoiceActorRole[]> {
    const rows = await this.prisma.animeCharacter.findMany({
      where: {
        voiceActorId,
        anime: { genres: { none: { slug: NSFW_HENTAI } } },
      },
      include: {
        character: { select: { id: true, name: true, imageUrl: true } },
        anime: {
          select: { id: true, slug: true, title: true, coverUrl: true, year: true },
        },
      },
      orderBy: [{ anime: { year: "desc" } }, { order: "asc" }],
    });

    return rows.map((r) => ({
      characterId: r.character.id,
      characterName: r.character.name,
      characterImageUrl: r.character.imageUrl,
      animeId: r.anime.id,
      animeSlug: r.anime.slug,
      animeTitle: r.anime.title,
      animeCoverUrl: r.anime.coverUrl,
      animeYear: r.anime.year,
      role: r.role,
    }));
  }

  async statsByVoiceActorId(voiceActorId: string): Promise<VoiceActorStats> {
    const [animeIds, characterIds] = await Promise.all([
      this.prisma.animeCharacter.findMany({
        where: { voiceActorId },
        select: { animeId: true },
        distinct: ["animeId"],
      }),
      this.prisma.animeCharacter.findMany({
        where: { voiceActorId },
        select: { characterId: true },
        distinct: ["characterId"],
      }),
    ]);

    return {
      animeCount: animeIds.length,
      roleCount: characterIds.length,
    };
  }
}
