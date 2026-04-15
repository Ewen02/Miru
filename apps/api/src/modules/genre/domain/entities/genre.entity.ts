import { Entity } from "@shared/domain/entity.base";

interface GenreProps {
  name: string;
  slug: string;
}

export class GenreEntity extends Entity<GenreProps> {
  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  static create(id: string, props: GenreProps): GenreEntity {
    return new GenreEntity(id, props);
  }
}
