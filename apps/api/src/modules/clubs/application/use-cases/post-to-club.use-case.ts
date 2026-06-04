import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { ClubDetailView, ClubRepositoryPort } from "../../domain/ports/club-repository.port";
import { CLUB_REPOSITORY } from "../tokens";

interface Input {
  slug: string;
  userId: string;
  body: string;
}

@Injectable()
export class PostToClubUseCase implements UseCase<Input, ClubDetailView> {
  constructor(@Inject(CLUB_REPOSITORY) private readonly clubRepo: ClubRepositoryPort) {}

  async execute({ slug, userId, body }: Input): Promise<ClubDetailView> {
    const trimmedBody = body.trim();
    if (trimmedBody.length < 1 || trimmedBody.length > 5000) {
      throw new ValidationException("Le message doit contenir entre 1 et 5000 caractères.");
    }

    const clubId = await this.clubRepo.findIdBySlug(slug);
    if (!clubId) {
      throw new NotFoundException("Club", slug);
    }

    await this.clubRepo.addPost(clubId, userId, trimmedBody);

    const club = await this.clubRepo.getClub(slug, userId);
    if (!club) {
      throw new NotFoundException("Club", slug);
    }
    return club;
  }
}
