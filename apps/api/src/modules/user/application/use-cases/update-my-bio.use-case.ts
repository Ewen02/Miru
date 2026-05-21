import { Inject, Injectable } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  /** Trimmed, ≤ 250 chars. Empty string → cleared (null in DB). */
  bio: string;
}

const MAX_BIO_LENGTH = 250;

@Injectable()
export class UpdateMyBioUseCase implements UseCase<Input, { bio: string | null }> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async execute({ userId, bio }: Input): Promise<{ bio: string | null }> {
    const trimmed = bio.trim();
    if (trimmed.length > MAX_BIO_LENGTH) {
      throw new ValidationException(`bio cannot exceed ${MAX_BIO_LENGTH} characters`);
    }
    const next = trimmed.length === 0 ? null : trimmed;
    await this.users.updateBio(userId, next);
    return { bio: next };
  }
}
