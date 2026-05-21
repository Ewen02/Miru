import { ForbiddenException } from "@shared/domain/domain-exception";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { makeUserRepoMock } from "../../domain/__fixtures__/user-repo.mock";
import { RevokeUserSessionUseCase } from "./revoke-user-session.use-case";

describe("RevokeUserSessionUseCase", () => {
  let repo: jest.Mocked<UserRepositoryPort>;
  let useCase: RevokeUserSessionUseCase;

  beforeEach(() => {
    repo = makeUserRepoMock();
    useCase = new RevokeUserSessionUseCase(repo);
  });

  it("refuses to revoke the current session", async () => {
    await expect(
      useCase.execute({
        userId: "u1",
        sessionId: "sess-current",
        currentSessionId: "sess-current",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.revokeSession).not.toHaveBeenCalled();
  });

  it("revokes a different session scoped to the user", async () => {
    await useCase.execute({
      userId: "u1",
      sessionId: "sess-other",
      currentSessionId: "sess-current",
    });
    expect(repo.revokeSession).toHaveBeenCalledWith("u1", "sess-other");
  });

  it("revokes when no currentSessionId is provided (e.g. admin or token flow)", async () => {
    await useCase.execute({
      userId: "u1",
      sessionId: "sess-other",
      currentSessionId: null,
    });
    expect(repo.revokeSession).toHaveBeenCalledWith("u1", "sess-other");
  });
});
