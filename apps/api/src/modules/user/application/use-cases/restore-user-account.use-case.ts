import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

interface Output {
  restored: boolean;
}

/**
 * S4-03 — cancel a pending soft deletion. Idempotent: calling on an
 * already-active account is a no-op that reports restored=false. Useful
 * when the same user signs in during the grace window and clicks "Annuler
 * la suppression" — the same endpoint serves the cancellation flow.
 */
@Injectable()
export class RestoreUserAccountUseCase implements UseCase<Input, Output> {
  private readonly logger = new Logger(RestoreUserAccountUseCase.name);

  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId }: Input): Promise<Output> {
    const wasSoftDeleted = (await this.users.deletedAt(userId)) !== null;
    if (!wasSoftDeleted) return { restored: false };
    await this.users.restoreDeletion(userId);
    this.logger.log(`User ${userId} cancelled their scheduled account deletion.`);
    return { restored: true };
  }
}
