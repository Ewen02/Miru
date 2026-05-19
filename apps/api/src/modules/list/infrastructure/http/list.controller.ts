import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { ListDetailDto, ListSummaryDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { OptionalAuthGuard } from "@auth/optional-auth.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { OptionalUserId } from "@auth/optional-user.decorator";
import { ListUserListsUseCase } from "../../application/use-cases/list-user-lists.use-case";
import { GetListDetailUseCase } from "../../application/use-cases/get-list-detail.use-case";
import { CreateListUseCase } from "../../application/use-cases/create-list.use-case";
import { DeleteListUseCase } from "../../application/use-cases/delete-list.use-case";
import {
  AddItemToListUseCase,
  RemoveItemFromListUseCase,
} from "../../application/use-cases/manage-list-item.use-case";
import { ToggleListLikeUseCase } from "../../application/use-cases/toggle-list-like.use-case";
import { AddListItemDto, CreateListDto, ListsFilterDto } from "./list.dto";
import { ListMapper } from "../../application/mappers/list.mapper";

@Controller("lists")
export class ListController {
  constructor(
    private readonly listUserLists: ListUserListsUseCase,
    private readonly getListDetail: GetListDetailUseCase,
    private readonly createList: CreateListUseCase,
    private readonly deleteList: DeleteListUseCase,
    private readonly addItem: AddItemToListUseCase,
    private readonly removeItem: RemoveItemFromListUseCase,
    private readonly toggleLike: ToggleListLikeUseCase,
  ) {}

  /**
   * `filter`: `mine` (default) → own lists; `liked` → lists liked by user;
   * `public` → public listing (anonymous-friendly).
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async list(
    @Query() query: ListsFilterDto,
    @OptionalUserId() userId: string | null,
  ): Promise<ListSummaryDto[]> {
    const filter = query.filter ?? (userId ? "mine" : "public");
    if ((filter === "mine" || filter === "liked") && !userId) {
      return [];
    }
    const summaries = await this.listUserLists.execute({
      userId: userId ?? "",
      filter,
    });
    return summaries.map(ListMapper.toSummaryDto);
  }

  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  async detail(
    @Param("id") id: string,
    @OptionalUserId() viewerUserId: string | null,
  ): Promise<ListDetailDto> {
    const { detail, likedByViewer, ownedByViewer } = await this.getListDetail.execute({
      listId: id,
      viewerUserId,
    });
    return ListMapper.toDetailDto(detail, likedByViewer, ownedByViewer);
  }

  @Post()
  @UseGuards(AuthRequiredGuard)
  @HttpCode(201)
  async create(
    @Body() body: CreateListDto,
    @CurrentUserId() userId: string,
  ): Promise<{ id: string; slug: string }> {
    const list = await this.createList.execute({
      userId,
      title: body.title,
      description: body.description,
      isPublic: body.isPublic,
    });
    return { id: list.id, slug: list.slug };
  }

  @Delete(":id")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async remove(@Param("id") id: string, @CurrentUserId() userId: string): Promise<void> {
    await this.deleteList.execute({ userId, listId: id });
  }

  @Post(":id/items")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async addItemToList(
    @Param("id") id: string,
    @Body() body: AddListItemDto,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    await this.addItem.execute({
      userId,
      listId: id,
      animeId: body.animeId,
      note: body.note,
    });
  }

  @Delete(":id/items/:animeId")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async removeItemFromList(
    @Param("id") id: string,
    @Param("animeId") animeId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    await this.removeItem.execute({ userId, listId: id, animeId });
  }

  @Put(":id/like")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async like(@Param("id") id: string, @CurrentUserId() userId: string): Promise<void> {
    await this.toggleLike.execute({ userId, listId: id, action: "like" });
  }

  @Delete(":id/like")
  @UseGuards(AuthRequiredGuard)
  @HttpCode(204)
  async unlike(@Param("id") id: string, @CurrentUserId() userId: string): Promise<void> {
    await this.toggleLike.execute({ userId, listId: id, action: "unlike" });
  }
}
