import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserOnboardingSnapshot,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

export interface OnboardingSnapshotView {
  /** When the user first finished /onboard. */
  onboardedAt: Date | null;
  /** Total watchlist entries across all statuses. */
  watchlistCount: number;
  /** Account creation timestamp. */
  joinedAt: Date | null;
  /** Days since signup, clamped at 0. Useful for "new user (<7d)" banners. */
  daysSinceJoined: number;
  /**
   * Derived flag: "should we show the AniList import nudge?". True for the
   * first 14 days after signup if the watchlist is empty. The web layer
   * still respects an explicit dismiss cookie on top.
   */
  shouldNudgeImport: boolean;
}

const NEW_USER_WINDOW_DAYS = 14;

@Injectable()
export class GetOnboardingSnapshotUseCase implements UseCase<string, OnboardingSnapshotView> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute(userId: string): Promise<OnboardingSnapshotView> {
    const snap = await this.users.onboardingSnapshot(userId);
    return toView(snap);
  }
}

function toView(snap: UserOnboardingSnapshot): OnboardingSnapshotView {
  const daysSinceJoined = snap.joinedAt
    ? Math.max(0, Math.floor((Date.now() - snap.joinedAt.getTime()) / 86_400_000))
    : 0;
  return {
    onboardedAt: snap.onboardedAt,
    watchlistCount: snap.watchlistCount,
    joinedAt: snap.joinedAt,
    daysSinceJoined,
    shouldNudgeImport: snap.watchlistCount === 0 && daysSinceJoined < NEW_USER_WINDOW_DAYS,
  };
}
