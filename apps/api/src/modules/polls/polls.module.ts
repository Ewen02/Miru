import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListPollsUseCase } from "./application/use-cases/list-polls.use-case";
import { VoteOnPollUseCase } from "./application/use-cases/vote-on-poll.use-case";
import { POLL_REPOSITORY } from "./application/tokens";
import { PrismaPollRepository } from "./infrastructure/persistence/prisma-poll.repository";
import { PollsController } from "./infrastructure/http/polls.controller";

@Module({
  imports: [PrismaModule],
  controllers: [PollsController],
  providers: [
    ListPollsUseCase,
    VoteOnPollUseCase,
    { provide: POLL_REPOSITORY, useClass: PrismaPollRepository },
  ],
  exports: [POLL_REPOSITORY],
})
export class PollsModule {}
