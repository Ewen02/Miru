import { Inject, Injectable, Logger } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

/**
 * Hard delete the user and every row that cascades from User. Caller is
 * responsible for re-auth (the HTTP layer requires a recent password
 * challenge — see DeleteAccountDto).
 */
@Injectable()
export class DeleteUserAccountUseCase implements UseCase<Input, void> {
  private readonly logger = new Logger(DeleteUserAccountUseCase.name);

  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId }: Input): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    await this.users.deleteById(userId);
    this.logger.warn(`User ${userId} self-deleted their account.`);
  }
}
