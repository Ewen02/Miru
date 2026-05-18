import {
  AnimeEntity,
  AnimePlatformSummary,
  AnimeRelationSummary,
  CharacterSummary,
} from "../../domain/entities/anime.entity";
import {
  AnimeCard,
  AnimeDetail,
  AnimeRelationCard,
  CharacterCard,
  PlatformLink,
} from "@miru/types";

/**
 * Mapper Entity → DTO de sortie.
 * Le controller ne manipule jamais les entities directement.
 */
export class AnimeMapper {
  static toCard(entity: AnimeEntity): AnimeCard {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      titleJp: entity.titleJp,
      coverUrl: entity.coverUrl,
      bannerUrl: entity.bannerUrl,
      accentHex: entity.accentHex,
      status: entity.status,
      format: entity.format,
      year: entity.year,
      studioName: entity.studioName,
      averageRating: entity.averageRating,
      genres: entity.genres,
    };
  }

  static toCardList(entities: AnimeEntity[]): AnimeCard[] {
    return entities.map(AnimeMapper.toCard);
  }

  static toCharacterCards(characters: CharacterSummary[]): CharacterCard[] {
    return characters
      .filter((c): c is CharacterSummary & { id: string } => c.id != null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        nameJp: c.nameJp,
        imageUrl: c.imageUrl,
        role: c.role,
        voiceActor: c.voiceActorName,
      }));
  }

  static toRelationCards(
    relations: AnimeRelationSummary[],
    slugByAnilistId: Map<number, string>,
  ): AnimeRelationCard[] {
    return relations.map((r) => ({
      relationType: r.relationType,
      title: r.title,
      coverUrl: r.coverUrl,
      format: r.format,
      year: r.year,
      slug: slugByAnilistId.get(r.relatedExternalAnilistId) ?? null,
    }));
  }

  static toPlatformLinks(platforms: AnimePlatformSummary[]): PlatformLink[] {
    return platforms.map((p) => ({
      slug: p.slug,
      name: p.name,
      iconUrl: p.iconUrl,
      color: p.color,
      url: p.url,
    }));
  }

  static toDetail(
    entity: AnimeEntity,
    slugByAnilistId: Map<number, string> = new Map(),
  ): AnimeDetail {
    return {
      ...AnimeMapper.toCard(entity),
      titleEn: entity.titleEn,
      synopsis: entity.synopsis,
      episodeCount: entity.episodeCount,
      episodes: entity.episodes.map((e) => ({
        id: e.id,
        number: e.number,
        title: e.title,
        titleJp: e.titleJp,
        titleRomaji: e.titleRomaji,
        duration: e.duration,
        airedAt: e.airedAt,
        filler: e.filler,
        recap: e.recap,
        thumbnail: e.thumbnail,
        url: e.url,
      })),
      characters: AnimeMapper.toCharacterCards(entity.characters),
      relations: AnimeMapper.toRelationCards(entity.relations, slugByAnilistId),
      platforms: AnimeMapper.toPlatformLinks(entity.platforms),
    };
  }
}
