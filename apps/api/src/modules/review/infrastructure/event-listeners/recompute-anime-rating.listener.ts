import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { REVIEW_REPOSITORY } from "../../application/tokens";
import { ReviewRepositoryPort } from "../../domain/ports/review-repository.port";
import { REVIEW_CHANGED_EVENT, type ReviewChangedPayload } from "../../application/events";

/**
 * Recomputes Anime.averageRating from the Review table whenever a review is
 * created, updated or removed. Keeps the catalog sort/filter consistent
 * without forcing the anime module to know about reviews.
 *
 * NOTE: AniList ships its own averageRating during sync. We override it here
 * with the user-derived value as soon as at least one review exists; if the
 * last review is deleted we leave the field as-is (the AniList number is
 * still a useful fallback for catalog sorting).
 */
@Injectable()
export class RecomputeAnimeRatingListener {
  private readonly logger = new Logger(RecomputeAnimeRatingListener.name);

  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviews: ReviewRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(REVIEW_CHANGED_EVENT)
  async handle({ animeId }: ReviewChangedPayload): Promise<void> {
    const stats = await this.reviews.statsForAnime(animeId);
    if (stats.count === 0) return;
    if (stats.averageRating == null) return;

    await this.prisma.anime.update({
      where: { id: animeId },
      data: { averageRating: stats.averageRating },
    });
    this.logger.log(
      `Anime ${animeId} averageRating refreshed: ${stats.averageRating.toFixed(2)} (${stats.count} reviews)`,
    );
  }
}
