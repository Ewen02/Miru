import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { ClubDetailView, ClubRepositoryPort } from "../../domain/ports/club-repository.port";
import { CLUB_REPOSITORY } from "../tokens";

interface Input {
  slug: string;
  userId: string;
}

@Injectable()
export class JoinClubUseCase implements UseCase<Input, ClubDetailView> {
  constructor(@Inject(CLUB_REPOSITORY) private readonly clubRepo: ClubRepositoryPort) {}

  async execute({ slug, userId }: Input): Promise<ClubDetailView> {
    const clubId = await this.clubRepo.findIdBySlug(slug);
    if (!clubId) {
      throw new NotFoundException("Club", slug);
    }

    await this.clubRepo.join(clubId, userId);

    const club = await this.clubRepo.getClub(slug, userId);
    if (!club) {
      throw new NotFoundException("Club", slug);
    }
    return club;
  }
}
