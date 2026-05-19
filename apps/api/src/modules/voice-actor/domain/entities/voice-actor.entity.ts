import { Entity } from "@shared/domain/entity.base";

interface VoiceActorProps {
  name: string;
}

export class VoiceActorEntity extends Entity<VoiceActorProps> {
  get name(): string {
    return this.props.name;
  }

  static create(id: string, props: VoiceActorProps): VoiceActorEntity {
    return new VoiceActorEntity(id, props);
  }
}
