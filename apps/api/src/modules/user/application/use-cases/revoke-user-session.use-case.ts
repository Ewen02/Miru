import { Injectable, Inject, ForbiddenException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  sessionId: string;
  /** Current session id from the request. Reject if it matches sessionId. */
  currentSessionId: string | null;
}

@Injectable()
export class RevokeUserSessionUseCase implements UseCase<Input, void> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId, sessionId, currentSessionId }: Input): Promise<void> {
    if (currentSessionId && sessionId === currentSessionId) {
      throw new ForbiddenException("Use /api/auth/sign-out to end the current session");
    }
    await this.users.revokeSession(userId, sessionId);
  }
}
