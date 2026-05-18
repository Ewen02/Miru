import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { DeleteReviewUseCase } from "./application/use-cases/delete-review.use-case";
import { ListReviewsForAnimeUseCase } from "./application/use-cases/list-reviews.use-case";
import { UpsertReviewUseCase } from "./application/use-cases/upsert-review.use-case";
import { REVIEW_REPOSITORY } from "./application/tokens";
import { PrismaReviewRepository } from "./infrastructure/persistence/prisma-review.repository";
import { ReviewController } from "./infrastructure/http/review.controller";
import { RecomputeAnimeRatingListener } from "./infrastructure/event-listeners/recompute-anime-rating.listener";

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [
    UpsertReviewUseCase,
    ListReviewsForAnimeUseCase,
    DeleteReviewUseCase,
    RecomputeAnimeRatingListener,
    { provide: REVIEW_REPOSITORY, useClass: PrismaReviewRepository },
  ],
  exports: [REVIEW_REPOSITORY],
})
export class ReviewModule {}
