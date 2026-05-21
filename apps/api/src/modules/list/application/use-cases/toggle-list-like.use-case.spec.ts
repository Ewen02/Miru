import { ForbiddenException, NotFoundException } from "@shared/domain/domain-exception";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { makeListRepoMock } from "../../domain/__fixtures__/list-repo.mock";
import { makeListEntity } from "../../domain/__fixtures__/list.fixture";
import { ToggleListLikeUseCase } from "./toggle-list-like.use-case";

describe("ToggleListLikeUseCase", () => {
  let repo: jest.Mocked<ListRepositoryPort>;
  let useCase: ToggleListLikeUseCase;

  beforeEach(() => {
    repo = makeListRepoMock();
    useCase = new ToggleListLikeUseCase(repo);
  });

  it("throws 404 when the list does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: "u1", listId: "missing", action: "like" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses to like a private list belonging to someone else", async () => {
    repo.findById.mockResolvedValue(
      makeListEntity({ userId: "owner", isPublic: false }),
    );
    await expect(
      useCase.execute({ userId: "other", listId: "list-1", action: "like" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.like).not.toHaveBeenCalled();
  });

  it("lets the owner like their own private list", async () => {
    repo.findById.mockResolvedValue(
      makeListEntity({ userId: "owner", isPublic: false }),
    );
    await useCase.execute({ userId: "owner", listId: "list-1", action: "like" });
    expect(repo.like).toHaveBeenCalledWith("owner", "list-1");
  });

  it("likes a public list", async () => {
    repo.findById.mockResolvedValue(makeListEntity({ isPublic: true }));
    await useCase.execute({ userId: "u1", listId: "list-1", action: "like" });
    expect(repo.like).toHaveBeenCalledWith("u1", "list-1");
  });

  it("unlikes via the unlike branch", async () => {
    repo.findById.mockResolvedValue(makeListEntity({ isPublic: true }));
    await useCase.execute({ userId: "u1", listId: "list-1", action: "unlike" });
    expect(repo.unlike).toHaveBeenCalledWith("u1", "list-1");
    expect(repo.like).not.toHaveBeenCalled();
  });
});
