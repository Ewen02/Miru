import { ForbiddenException, NotFoundException } from "@shared/domain/domain-exception";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { makeListRepoMock } from "../../domain/__fixtures__/list-repo.mock";
import { makeListEntity } from "../../domain/__fixtures__/list.fixture";
import { AddItemToListUseCase } from "./add-list-item.use-case";

describe("AddItemToListUseCase", () => {
  let repo: jest.Mocked<ListRepositoryPort>;
  let useCase: AddItemToListUseCase;

  beforeEach(() => {
    repo = makeListRepoMock();
    useCase = new AddItemToListUseCase(repo);
  });

  it("throws 404 when the list does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: "u1", listId: "missing", animeId: "a1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses when the user is not the owner", async () => {
    repo.findById.mockResolvedValue(makeListEntity({ userId: "owner" }));
    await expect(
      useCase.execute({ userId: "other", listId: "list-1", animeId: "a1" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.addItem).not.toHaveBeenCalled();
  });

  it("adds the item when the user is the owner", async () => {
    repo.findById.mockResolvedValue(makeListEntity({ userId: "owner" }));
    await useCase.execute({
      userId: "owner",
      listId: "list-1",
      animeId: "a1",
      note: "Must-see",
    });
    expect(repo.addItem).toHaveBeenCalledWith("list-1", "a1", "Must-see");
  });
});
