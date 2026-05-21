import { ForbiddenException, NotFoundException } from "@shared/domain/domain-exception";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { makeListRepoMock } from "../../domain/__fixtures__/list-repo.mock";
import { makeListEntity } from "../../domain/__fixtures__/list.fixture";
import { GetListDetailUseCase } from "./get-list-detail.use-case";

describe("GetListDetailUseCase", () => {
  let repo: jest.Mocked<ListRepositoryPort>;
  let useCase: GetListDetailUseCase;

  beforeEach(() => {
    repo = makeListRepoMock();
    useCase = new GetListDetailUseCase(repo);
  });

  it("throws 404 when the list does not exist", async () => {
    repo.findWithItems.mockResolvedValue(null);
    await expect(
      useCase.execute({ listId: "missing", viewerUserId: null }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("hides a private list from anonymous viewers", async () => {
    repo.findWithItems.mockResolvedValue({
      list: makeListEntity({ isPublic: false, userId: "owner" }),
      ownerName: "owner",
      itemCount: 0,
      likeCount: 0,
      items: [],
    });

    await expect(
      useCase.execute({ listId: "list-1", viewerUserId: null }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("hides a private list from non-owners", async () => {
    repo.findWithItems.mockResolvedValue({
      list: makeListEntity({ isPublic: false, userId: "owner" }),
      ownerName: "owner",
      itemCount: 0,
      likeCount: 0,
      items: [],
    });

    await expect(
      useCase.execute({ listId: "list-1", viewerUserId: "other" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("lets the owner read their own private list", async () => {
    const list = makeListEntity({ isPublic: false, userId: "owner" });
    repo.findWithItems.mockResolvedValue({
      list,
      ownerName: "owner",
      itemCount: 0,
      likeCount: 0,
      items: [],
    });
    repo.isLikedBy.mockResolvedValue(false);

    const result = await useCase.execute({
      listId: "list-1",
      viewerUserId: "owner",
    });

    expect(result.ownedByViewer).toBe(true);
  });

  it("flags likedByViewer when the viewer has liked the list", async () => {
    const list = makeListEntity({ isPublic: true });
    repo.findWithItems.mockResolvedValue({
      list,
      ownerName: "owner",
      itemCount: 0,
      likeCount: 0,
      items: [],
    });
    repo.isLikedBy.mockResolvedValue(true);

    const result = await useCase.execute({
      listId: "list-1",
      viewerUserId: "u-viewer",
    });

    expect(result.likedByViewer).toBe(true);
    expect(repo.isLikedBy).toHaveBeenCalledWith("u-viewer", "list-1");
  });

  it("does not check likedByViewer when anonymous", async () => {
    const list = makeListEntity({ isPublic: true });
    repo.findWithItems.mockResolvedValue({
      list,
      ownerName: "owner",
      itemCount: 0,
      likeCount: 0,
      items: [],
    });

    const result = await useCase.execute({
      listId: "list-1",
      viewerUserId: null,
    });

    expect(result.likedByViewer).toBe(false);
    expect(repo.isLikedBy).not.toHaveBeenCalled();
  });
});
