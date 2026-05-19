import { Entity } from "@shared/domain/entity.base";

interface StudioProps {
  name: string;
  slug: string;
}

export class StudioEntity extends Entity<StudioProps> {
  get name(): string {
    return this.props.name;
  }
  get slug(): string {
    return this.props.slug;
  }

  static create(id: string, props: StudioProps): StudioEntity {
    return new StudioEntity(id, props);
  }
}
