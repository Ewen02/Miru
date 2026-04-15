import { AnimeEntity } from "../../domain/entities/anime.entity";
import { AnimeCard } from "@miru/types";

/**
 * Mapper Entity → DTO de sortie.
 * Le controller ne manipule jamais les entities directement.
 */
export class AnimeMapper {
  static toCard(entity: AnimeEntity): AnimeCard {
    return {
      id: entity.id,
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
}
