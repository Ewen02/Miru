import { AnimeEntity, CharacterSummary } from "../../domain/entities/anime.entity";
import { AnimeCard, AnimeDetail, CharacterCard } from "@miru/types";

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

  static toDetail(entity: AnimeEntity): AnimeDetail {
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
    };
  }
}
