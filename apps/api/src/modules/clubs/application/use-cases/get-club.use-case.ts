import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { ClubDetailView, ClubRepositoryPort } from "../../domain/ports/club-repository.port";
import { CLUB_REPOSITORY } from "../tokens";

interface Input {
  slug: string;
  viewerId?: string | null;
}

@Injectable()
export class GetClubUseCase implements UseCase<Input, ClubDetailView> {
  constructor(@Inject(CLUB_REPOSITORY) private readonly clubRepo: ClubRepositoryPort) {}

  async execute({ slug, viewerId }: Input): Promise<ClubDetailView> {
    const club = await this.clubRepo.getClub(slug, viewerId ?? null);
    if (!club) {
      throw new NotFoundException("Club", slug);
    }
    return club;
  }
}
