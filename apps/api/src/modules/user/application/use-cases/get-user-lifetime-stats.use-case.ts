import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserLifetimeStats,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface GetUserLifetimeStatsInput {
  /** Session user id. The page is private (not derivable from a public handle). */
  userId: string;
}

interface GetUserLifetimeStatsOutput {
  joinedAt: Date | null;
  stats: UserLifetimeStats;
}

@Injectable()
export class GetUserLifetimeStatsUseCase
  implements UseCase<GetUserLifetimeStatsInput, GetUserLifetimeStatsOutput>
{
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId }: GetUserLifetimeStatsInput): Promise<GetUserLifetimeStatsOutput> {
    if (!userId) throw new UnauthorizedException("Session required");

    const [joinedAt, stats] = await Promise.all([
      this.users.joinedAt(userId),
      this.users.lifetimeStatsByUserId(userId),
    ]);

    return { joinedAt, stats };
  }
}
