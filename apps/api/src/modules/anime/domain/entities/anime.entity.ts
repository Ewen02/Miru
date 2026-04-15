import { Entity } from "@shared/domain/entity.base";
import { AnimeStatus, AnimeFormat } from "@miru/types";
import { InvalidRatingException } from "../exceptions/anime.exceptions";

export interface EpisodeSummary {
  id: string;
  number: number;
  title: string | null;
  duration: number | null;
  airedAt: Date | null;
}

interface AnimeProps {
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
  trailerUrl: string | null;
  averageRating: number | null;
  externalAnilistId: number | null;
  genres: string[];
  episodes: EpisodeSummary[];
}

export class AnimeEntity extends Entity<AnimeProps> {
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

  get averageRating(): number | null {
    return this.props.averageRating;
  }

  get coverUrl(): string | null {
    return this.props.coverUrl;
  }

  get bannerUrl(): string | null {
    return this.props.bannerUrl;
  }

  get trailerUrl(): string | null {
    return this.props.trailerUrl;
  }

  get year(): number | null {
    return this.props.year;
  }

  get studioName(): string | null {
    return this.props.studioName;
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
