import { Entity } from "@shared/domain/entity.base";

interface PlatformProps {
  name: string;
  slug: string;
  iconUrl: string | null;
  color: string | null;
  baseUrl: string;
}

export class PlatformEntity extends Entity<PlatformProps> {
  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get iconUrl(): string | null {
    return this.props.iconUrl;
  }

  get color(): string | null {
    return this.props.color;
  }

  get baseUrl(): string {
    return this.props.baseUrl;
  }

  static create(id: string, props: PlatformProps): PlatformEntity {
    return new PlatformEntity(id, props);
  }
}
