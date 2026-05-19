import { Injectable, Inject, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserRepositoryPort,
  YearInReview,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  year: number;
}

@Injectable()
export class GetUserYearInReviewUseCase implements UseCase<Input, YearInReview> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId, year }: Input): Promise<YearInReview> {
    if (!userId) throw new UnauthorizedException("Session required");
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
      throw new BadRequestException(`Invalid year: ${year}`);
    }
    return this.users.yearInReviewByUserId(userId, year);
  }
}
