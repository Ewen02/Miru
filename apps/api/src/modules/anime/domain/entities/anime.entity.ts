import { Entity } from "@shared/domain/entity.base";
import { AnimeStatus, AnimeFormat, CharacterRole } from "@miru/types";
import { InvalidRatingException } from "../exceptions/anime.exceptions";

export interface CharacterSummary {
  id: string | null;
  externalAnilistId: number;
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  role: CharacterRole;
  /** Local DB id of the voice actor — drives the /people/[id] link. */
  voiceActorId: string | null;
  voiceActorAnilistId: number | null;
  voiceActorName: string | null;
  order: number;
}

export interface EpisodeSummary {
  id: string;
  number: number;
  title: string | null;
  titleJp: string | null;
  titleRomaji: string | null;
  duration: number | null;
  airedAt: Date | null;
  filler: boolean;
  recap: boolean;
  thumbnail: string | null;
  url: string | null;
}

export type RelationType = "SEQUEL" | "PREQUEL" | "SIDE_STORY" | "SPIN_OFF";

export interface AnimeRelationSummary {
  relatedExternalAnilistId: number;
  relationType: RelationType;
  title: string;
  coverUrl: string | null;
  format: string | null;
  year: number | null;
}

export interface AnimePlatformSummary {
  slug: string;
  name: string;
  iconUrl: string | null;
  color: string | null;
  url: string;
}

interface AnimeProps {
  slug: string;
  title: string;
  titleJp: string | null;
  titleEn: string | null;
  synopsis: string | null;
  status: AnimeStatus;
  format: AnimeFormat;
  episodeCount: number | null;
  year: number | null;
  studioName: string | null;
  studioSlug: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  accentHex: string | null;
  averageRating: number | null;
  externalAnilistId: number | null;
  externalMalId: number | null;
  genres: string[];
  episodes: EpisodeSummary[];
  characters: CharacterSummary[];
  relations: AnimeRelationSummary[];
  platforms: AnimePlatformSummary[];
}

export class AnimeEntity extends Entity<AnimeProps> {
  get slug(): string {
    return this.props.slug;
  }

  get title(): string {
    return this.props.title;
  }

  get titleJp(): string | null {
    return this.props.titleJp;
  }

  get titleEn(): string | null {
    return this.props.titleEn;
  }

  get synopsis(): string | null {
    return this.props.synopsis;
  }

  get status(): AnimeStatus {
    return this.props.status;
  }

  get format(): AnimeFormat {
    return this.props.format;
  }

  get episodeCount(): number | null {
    return this.props.episodeCount;
  }

  get genres(): string[] {
    return [...this.props.genres];
  }

  get episodes(): EpisodeSummary[] {
    return [...this.props.episodes];
  }

  get characters(): CharacterSummary[] {
    return [...this.props.characters];
  }

  get relations(): AnimeRelationSummary[] {
    return [...this.props.relations];
  }

  get platforms(): AnimePlatformSummary[] {
    return [...this.props.platforms];
  }

  get averageRating(): number | null {
    return this.props.averageRating;
  }

  get coverUrl(): string | null {
    return this.props.coverUrl;
  }

  get bannerUrl(): string | null {
    return this.props.bannerUrl;
  }

  get accentHex(): string | null {
    return this.props.accentHex;
  }

  get year(): number | null {
    return this.props.year;
  }

  get studioName(): string | null {
    return this.props.studioName;
  }

  get externalMalId(): number | null {
    return this.props.externalMalId;
  }

  /** Canal d'accès pour la couche persistence. */
  toSnapshot(): Readonly<AnimeProps> & { id: string } {
    return { id: this._id, ...this.props };
  }

  updateRating(newRating: number): void {
    if (newRating < 0 || newRating > 10) {
      throw new InvalidRatingException(newRating);
    }
    this.props.averageRating = newRating;
  }

  updateFromSync(data: Partial<AnimeProps>): void {
    Object.assign(this.props, data);
  }

  static create(id: string, props: AnimeProps): AnimeEntity {
    return new AnimeEntity(id, props);
  }
}
