import { Inject, Injectable, Logger } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

interface Output {
  deletedAt: Date;
}

/**
 * S4-03 — soft deletion. The account is marked for deletion now, but
 * actual data removal happens 30 days later via the retention scheduler.
 *
 * During the grace window:
 *  - Public profile gates already block via the standard "is this user
 *    fetchable" path (the public route honours `deletedAt`).
 *  - The owner can call RestoreUserAccountUseCase to cancel.
 *
 * Caller is responsible for re-auth (the HTTP layer requires a "DELETE"
 * confirmation in the body — see DeleteAccountDto).
 */
@Injectable()
export class DeleteUserAccountUseCase implements UseCase<Input, Output> {
  private readonly logger = new Logger(DeleteUserAccountUseCase.name);

  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId }: Input): Promise<Output> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    await this.users.softDelete(userId);
    const deletedAt = (await this.users.deletedAt(userId)) ?? new Date();
    this.logger.warn(
      `User ${userId} scheduled their account for deletion at ${deletedAt.toISOString()}`,
    );
    return { deletedAt };
  }
}
