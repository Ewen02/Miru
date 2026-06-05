import { Injectable, Inject } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserFavoriteAnime,
  UserProfileStats,
  UserPublicAchievement,
  UserPublicReview,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";
import { UserEntity } from "../../domain/entities/user.entity";

interface GetUserProfileInput {
  handle: string;
  /**
   * Authenticated viewer's id, or null if anonymous. Drives the
   * privacy gate: a private profile is only visible to its owner.
   */
  viewerId?: string | null;
}

interface GetUserProfileOutput {
  user: UserEntity;
  joinedAt: Date | null;
  isPro: boolean;
  stats: UserProfileStats;
  favorites: UserFavoriteAnime[];
  reviews: UserPublicReview[];
  recentAchievements: UserPublicAchievement[];
  followCounts: { followers: number; following: number };
}

const FAVORITES_LIMIT = 5;
const REVIEWS_LIMIT = 3;
const ACHIEVEMENTS_LIMIT = 3;

@Injectable()
export class GetUserProfileUseCase implements UseCase<GetUserProfileInput, GetUserProfileOutput> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ handle, viewerId }: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const user = await this.users.findByHandle(handle);
    if (!user) throw new NotFoundException(`User "${handle}" not found`);

    // S4-02: privacy gate. Return a 404 (not 403) so private accounts
    // are indistinguishable from non-existent ones — leaks no signal
    // that the handle is taken or who owns it.
    if (viewerId !== user.id) {
      const prefs = await this.users.preferencesByUserId(user.id);
      if (prefs.isPrivate) {
        throw new NotFoundException(`User "${handle}" not found`);
      }
    }

    const [joinedAt, isPro, stats, favorites, reviews, recentAchievements, followCounts] =
      await Promise.all([
        this.users.joinedAt(user.id),
        this.users.isProByUserId(user.id),
        this.users.statsByUserId(user.id),
        this.users.favoritesByUserId(user.id, FAVORITES_LIMIT),
        this.users.reviewsByUserId(user.id, REVIEWS_LIMIT),
        this.users.recentAchievementsByUserId(user.id, ACHIEVEMENTS_LIMIT),
        this.users.followCountsByUserId(user.id),
      ]);

    return { user, joinedAt, isPro, stats, favorites, reviews, recentAchievements, followCounts };
  }
}
