import { Entity } from "@shared/domain/entity.base";

interface CharacterProps {
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
}

export class CharacterEntity extends Entity<CharacterProps> {
  get name(): string {
    return this.props.name;
  }
  get nameJp(): string | null {
    return this.props.nameJp;
  }
  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  static create(id: string, props: CharacterProps): CharacterEntity {
    return new CharacterEntity(id, props);
  }
}
