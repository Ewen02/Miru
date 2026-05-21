import { ForbiddenException, NotFoundException } from "@shared/domain/domain-exception";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { makeListRepoMock } from "../../domain/__fixtures__/list-repo.mock";
import { makeListEntity } from "../../domain/__fixtures__/list.fixture";
import { DeleteListUseCase } from "./delete-list.use-case";

describe("DeleteListUseCase", () => {
  let repo: jest.Mocked<ListRepositoryPort>;
  let useCase: DeleteListUseCase;

  beforeEach(() => {
    repo = makeListRepoMock();
    useCase = new DeleteListUseCase(repo);
  });

  it("throws 404 when the list does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: "u1", listId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses deletion when the user is not the owner", async () => {
    repo.findById.mockResolvedValue(makeListEntity({ userId: "owner" }));
    await expect(
      useCase.execute({ userId: "other", listId: "list-1" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes the list when the user is the owner", async () => {
    repo.findById.mockResolvedValue(makeListEntity({ userId: "owner" }));
    await useCase.execute({ userId: "owner", listId: "list-1" });
    expect(repo.delete).toHaveBeenCalledWith("list-1");
  });
});
