import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListUserListsUseCase } from "./application/use-cases/list-user-lists.use-case";
import { GetListDetailUseCase } from "./application/use-cases/get-list-detail.use-case";
import { CreateListUseCase } from "./application/use-cases/create-list.use-case";
import { DeleteListUseCase } from "./application/use-cases/delete-list.use-case";
import { AddItemToListUseCase } from "./application/use-cases/add-list-item.use-case";
import { RemoveItemFromListUseCase } from "./application/use-cases/remove-list-item.use-case";
import { ToggleListLikeUseCase } from "./application/use-cases/toggle-list-like.use-case";
import { LIST_REPOSITORY } from "./application/tokens";
import { PrismaListRepository } from "./infrastructure/persistence/prisma-list.repository";
import { ListController } from "./infrastructure/http/list.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ListController],
  providers: [
    ListUserListsUseCase,
    GetListDetailUseCase,
    CreateListUseCase,
    DeleteListUseCase,
    AddItemToListUseCase,
    RemoveItemFromListUseCase,
    ToggleListLikeUseCase,
    { provide: LIST_REPOSITORY, useClass: PrismaListRepository },
  ],
  exports: [LIST_REPOSITORY],
})
export class ListModule {}
