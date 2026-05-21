import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { makeListRepoMock } from "../../domain/__fixtures__/list-repo.mock";
import { ListUserListsUseCase } from "./list-user-lists.use-case";

describe("ListUserListsUseCase", () => {
  let repo: jest.Mocked<ListRepositoryPort>;
  let useCase: ListUserListsUseCase;

  beforeEach(() => {
    repo = makeListRepoMock();
    useCase = new ListUserListsUseCase(repo);
  });

  it("dispatches `mine` to findByUserId", async () => {
    repo.findByUserId.mockResolvedValue([]);
    await useCase.execute({ userId: "u1", filter: "mine" });
    expect(repo.findByUserId).toHaveBeenCalledWith("u1");
    expect(repo.findLikedByUserId).not.toHaveBeenCalled();
    expect(repo.findPublic).not.toHaveBeenCalled();
  });

  it("dispatches `liked` to findLikedByUserId", async () => {
    repo.findLikedByUserId.mockResolvedValue([]);
    await useCase.execute({ userId: "u1", filter: "liked" });
    expect(repo.findLikedByUserId).toHaveBeenCalledWith("u1");
  });

  it("dispatches `public` to findPublic", async () => {
    repo.findPublic.mockResolvedValue([]);
    await useCase.execute({ userId: "u1", filter: "public" });
    expect(repo.findPublic).toHaveBeenCalledWith(24);
  });
});
