import { Injectable, Inject } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserFavoriteAnime,
  UserProfileStats,
  UserPublicReview,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";
import { UserEntity } from "../../domain/entities/user.entity";

interface GetUserProfileInput {
  handle: string;
}

interface GetUserProfileOutput {
  user: UserEntity;
  joinedAt: Date | null;
  isPro: boolean;
  stats: UserProfileStats;
  favorites: UserFavoriteAnime[];
  reviews: UserPublicReview[];
}

const FAVORITES_LIMIT = 5;
const REVIEWS_LIMIT = 3;

@Injectable()
export class GetUserProfileUseCase
  implements UseCase<GetUserProfileInput, GetUserProfileOutput>
{
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ handle }: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const user = await this.users.findByHandle(handle);
    if (!user) throw new NotFoundException(`User "${handle}" not found`);

    const [joinedAt, isPro, stats, favorites, reviews] = await Promise.all([
      this.users.joinedAt(user.id),
      this.users.isProByUserId(user.id),
      this.users.statsByUserId(user.id),
      this.users.favoritesByUserId(user.id, FAVORITES_LIMIT),
      this.users.reviewsByUserId(user.id, REVIEWS_LIMIT),
    ]);

    return { user, joinedAt, isPro, stats, favorites, reviews };
  }
}
