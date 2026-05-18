import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { ReviewEntity } from "../../domain/entities/review.entity";
import { ReviewWithAuthor } from "../../domain/ports/review-repository.port";
import { DeleteReviewUseCase } from "../../application/use-cases/delete-review.use-case";
import { ListReviewsForAnimeUseCase } from "../../application/use-cases/list-reviews.use-case";
import { UpsertReviewUseCase } from "../../application/use-cases/upsert-review.use-case";
import { UpsertReviewDto, ReviewDto, ReviewListItemDto } from "./review.dto";

@Controller()
export class ReviewController {
  constructor(
    private readonly upsertReview: UpsertReviewUseCase,
    private readonly listReviewsForAnime: ListReviewsForAnimeUseCase,
    private readonly deleteReview: DeleteReviewUseCase,
  ) {}

  @Get("animes/:animeId/reviews")
  async list(@Param("animeId") animeId: string): Promise<ReviewListItemDto[]> {
    const items = await this.listReviewsForAnime.execute(animeId);
    return items.map(toListItemDto);
  }

  @Post("animes/:animeId/reviews")
  @UseGuards(AuthRequiredGuard)
  async upsert(
    @CurrentUserId() userId: string,
    @Param("animeId") animeId: string,
    @Body() body: UpsertReviewDto,
  ): Promise<ReviewDto> {
    const review = await this.upsertReview.execute({
      userId,
      animeId,
      rating: body.rating,
      body: body.body ?? null,
    });
    return toReviewDto(review);
  }

  @Delete("reviews/:id")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async delete(
    @CurrentUserId() userId: string,
    @Param("id") reviewId: string,
  ): Promise<void> {
    await this.deleteReview.execute({ reviewId, userId });
  }
}

function toReviewDto(review: ReviewEntity): ReviewDto {
  return {
    id: review.id,
    userId: review.userId,
    animeId: review.animeId,
    rating: review.rating,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

function toListItemDto(item: ReviewWithAuthor): ReviewListItemDto {
  return {
    ...toReviewDto(item.review),
    author: item.author,
  };
}
