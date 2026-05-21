import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserPreferences,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

@Injectable()
export class GetUserPreferencesUseCase implements UseCase<Input, UserPreferences> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  execute({ userId }: Input): Promise<UserPreferences> {
    return this.users.preferencesByUserId(userId);
  }
}
