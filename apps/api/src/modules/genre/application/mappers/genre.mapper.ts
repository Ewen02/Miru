import { GenreEntity } from "../../domain/entities/genre.entity";
import { GenreCard } from "@miru/types";

export class GenreMapper {
  static toCard(entity: GenreEntity): GenreCard {
    return {
      slug: entity.slug,
      name: entity.name,
    };
  }

  static toCardList(entities: GenreEntity[]): GenreCard[] {
    return entities.map(GenreMapper.toCard);
  }
}
