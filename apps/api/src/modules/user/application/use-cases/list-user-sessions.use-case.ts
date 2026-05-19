import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserActiveSession,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  /** The id of the session the request was made from — flagged as `current`. */
  currentSessionId: string | null;
}

@Injectable()
export class ListUserSessionsUseCase implements UseCase<Input, UserActiveSession[]> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId, currentSessionId }: Input): Promise<UserActiveSession[]> {
    const sessions = await this.users.activeSessionsByUserId(userId);
    return sessions.map((s) => ({
      ...s,
      current: s.id === currentSessionId,
    }));
  }
}
