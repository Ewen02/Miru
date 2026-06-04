import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListClubsUseCase } from "./application/use-cases/list-clubs.use-case";
import { GetClubUseCase } from "./application/use-cases/get-club.use-case";
import { CreateClubUseCase } from "./application/use-cases/create-club.use-case";
import { JoinClubUseCase } from "./application/use-cases/join-club.use-case";
import { LeaveClubUseCase } from "./application/use-cases/leave-club.use-case";
import { PostToClubUseCase } from "./application/use-cases/post-to-club.use-case";
import { CLUB_REPOSITORY } from "./application/tokens";
import { PrismaClubRepository } from "./infrastructure/persistence/prisma-club.repository";
import { ClubsController } from "./infrastructure/http/clubs.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ClubsController],
  providers: [
    ListClubsUseCase,
    GetClubUseCase,
    CreateClubUseCase,
    JoinClubUseCase,
    LeaveClubUseCase,
    PostToClubUseCase,
    { provide: CLUB_REPOSITORY, useClass: PrismaClubRepository },
  ],
  exports: [CLUB_REPOSITORY],
})
export class ClubsModule {}
