import { ValidationException } from "@shared/domain/domain-exception";
import { ListRepositoryPort } from "../../domain/ports/list-repository.port";
import { makeListRepoMock } from "../../domain/__fixtures__/list-repo.mock";
import { makeListEntity } from "../../domain/__fixtures__/list.fixture";
import { CreateListUseCase } from "./create-list.use-case";

describe("CreateListUseCase", () => {
  let repo: jest.Mocked<ListRepositoryPort>;
  let useCase: CreateListUseCase;

  beforeEach(() => {
    repo = makeListRepoMock();
    useCase = new CreateListUseCase(repo);
  });

  it("rejects a title under 2 characters", async () => {
    await expect(
      useCase.execute({ userId: "u1", title: "a" }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it("rejects a title over 80 characters", async () => {
    await expect(
      useCase.execute({ userId: "u1", title: "x".repeat(81) }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it("rejects a title that slugifies to empty", async () => {
    await expect(
      useCase.execute({ userId: "u1", title: "!!" }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it("trims whitespace and delegates to the repository with a valid slug", async () => {
    const created = makeListEntity({ title: "Comfort watch", slug: "comfort-watch" });
    repo.create.mockResolvedValue(created);

    const result = await useCase.execute({
      userId: "u1",
      title: "  Comfort watch  ",
      description: "Pour les soirées calmes",
    });

    expect(repo.create).toHaveBeenCalledWith({
      userId: "u1",
      title: "Comfort watch",
      description: "Pour les soirées calmes",
      slug: "comfort-watch",
      isPublic: true,
    });
    expect(result).toBe(created);
  });
});
