import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserNotFoundException } from "../../domain/exceptions/user.exceptions";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

@Injectable()
export class GetCurrentUserUseCase implements UseCase<string, UserEntity> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user;
  }
}
