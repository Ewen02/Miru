import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { makeUserRepoMock } from "../../domain/__fixtures__/user-repo.mock";
import { ListUserSessionsUseCase } from "./list-user-sessions.use-case";

describe("ListUserSessionsUseCase", () => {
  let repo: jest.Mocked<UserRepositoryPort>;
  let useCase: ListUserSessionsUseCase;

  beforeEach(() => {
    repo = makeUserRepoMock();
    useCase = new ListUserSessionsUseCase(repo);
  });

  it("flags only the matching session as current", async () => {
    repo.activeSessionsByUserId.mockResolvedValue([
      {
        id: "sess-current",
        userAgent: "Chrome",
        ipAddress: "1.1.1.1",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
      {
        id: "sess-other",
        userAgent: "Safari",
        ipAddress: "2.2.2.2",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    ]);

    const result = await useCase.execute({
      userId: "u1",
      currentSessionId: "sess-current",
    });

    expect(result).toHaveLength(2);
    expect(result[0].current).toBe(true);
    expect(result[1].current).toBe(false);
  });

  it("returns no current flag when the request has no session id", async () => {
    repo.activeSessionsByUserId.mockResolvedValue([
      {
        id: "sess-a",
        userAgent: null,
        ipAddress: null,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    ]);

    const result = await useCase.execute({ userId: "u1", currentSessionId: null });

    expect(result[0].current).toBe(false);
  });
});
