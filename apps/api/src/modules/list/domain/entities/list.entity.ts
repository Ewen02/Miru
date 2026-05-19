import { Entity } from "@shared/domain/entity.base";

interface ListProps {
  userId: string;
  title: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  coverArtSeed: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ListEntity extends Entity<ListProps> {
  get userId(): string {
    return this.props.userId;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | null {
    return this.props.description;
  }
  get slug(): string {
    return this.props.slug;
  }
  get isPublic(): boolean {
    return this.props.isPublic;
  }
  get coverArtSeed(): number | null {
    return this.props.coverArtSeed;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(id: string, props: ListProps): ListEntity {
    return new ListEntity(id, props);
  }
}
