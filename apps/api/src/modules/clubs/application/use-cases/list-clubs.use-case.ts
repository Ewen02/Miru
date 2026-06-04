import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { ClubRepositoryPort, ClubSummaryView } from "../../domain/ports/club-repository.port";
import { CLUB_REPOSITORY } from "../tokens";

const DEFAULT_LIMIT = 30;

interface Input {
  viewerId?: string | null;
  limit?: number;
}

@Injectable()
export class ListClubsUseCase implements UseCase<Input, ClubSummaryView[]> {
  constructor(@Inject(CLUB_REPOSITORY) private readonly clubRepo: ClubRepositoryPort) {}

  async execute({ viewerId, limit }: Input): Promise<ClubSummaryView[]> {
    return this.clubRepo.listClubs(viewerId ?? null, limit ?? DEFAULT_LIMIT);
  }
}
