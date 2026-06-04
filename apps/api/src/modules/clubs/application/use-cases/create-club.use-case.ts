import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { slugify } from "@shared/utils/slugify";
import { ClubDetailView, ClubRepositoryPort } from "../../domain/ports/club-repository.port";
import { CLUB_REPOSITORY } from "../tokens";

interface Input {
  ownerId: string;
  name: string;
  description?: string | null;
}

@Injectable()
export class CreateClubUseCase implements UseCase<Input, ClubDetailView> {
  constructor(@Inject(CLUB_REPOSITORY) private readonly clubRepo: ClubRepositoryPort) {}

  async execute({ ownerId, name, description }: Input): Promise<ClubDetailView> {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 120) {
      throw new ValidationException("Le nom doit contenir entre 2 et 120 caractères.");
    }

    const slug = slugify(trimmedName);
    if (!slug) {
      throw new ValidationException("Le nom produit un slug vide.");
    }

    const createdSlug = await this.clubRepo.createClub({
      name: trimmedName,
      slug,
      description: description ?? null,
      ownerId,
    });

    const club = await this.clubRepo.getClub(createdSlug, ownerId);
    if (!club) {
      throw new NotFoundException("Club", createdSlug);
    }
    return club;
  }
}
