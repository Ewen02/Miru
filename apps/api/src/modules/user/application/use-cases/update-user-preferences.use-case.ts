import { Inject, Injectable } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  UserPreferences,
  UserPreferencesPatch,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  patch: UserPreferencesPatch;
}

@Injectable()
export class UpdateUserPreferencesUseCase implements UseCase<Input, UserPreferences> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId, patch }: Input): Promise<UserPreferences> {
    this.validate(patch);
    return this.users.updatePreferences(userId, patch);
  }

  private validate(patch: UserPreferencesPatch): void {
    for (const key of ["quietFromHour", "quietToHour"] as const) {
      const value = patch[key];
      if (value === undefined || value === null) continue;
      if (!Number.isInteger(value) || value < 0 || value > 23) {
        throw new ValidationException(`${key} must be an integer 0-23`);
      }
    }
    // If one side of the quiet range is set, the other must be set too
    // (or both null = disabled). Mixed nulls would be ambiguous.
    const fromSet = patch.quietFromHour != null;
    const toSet = patch.quietToHour != null;
    if (fromSet !== toSet && (patch.quietFromHour !== undefined || patch.quietToHour !== undefined)) {
      throw new ValidationException(
        "quietFromHour and quietToHour must both be set or both null",
      );
    }
  }
}
