import { NotificationRepositoryPort } from "../../domain/ports/notification-repository.port";
import { makeNotificationRepoMock } from "../../domain/__fixtures__/notification-repo.mock";
import { ListNotificationsUseCase } from "./list-notifications.use-case";

describe("ListNotificationsUseCase", () => {
  let repo: jest.Mocked<NotificationRepositoryPort>;
  let useCase: ListNotificationsUseCase;

  beforeEach(() => {
    repo = makeNotificationRepoMock();
    useCase = new ListNotificationsUseCase(repo);
  });

  it("loads items and unread count in parallel with the default limit", async () => {
    repo.findByUserId.mockResolvedValue([]);
    repo.unreadCountByUserId.mockResolvedValue(0);

    const result = await useCase.execute({ userId: "u1" });

    expect(repo.findByUserId).toHaveBeenCalledWith("u1", 30);
    expect(repo.unreadCountByUserId).toHaveBeenCalledWith("u1");
    expect(result.items).toEqual([]);
    expect(result.unreadCount).toBe(0);
  });

  it("respects an explicit limit", async () => {
    repo.findByUserId.mockResolvedValue([]);
    repo.unreadCountByUserId.mockResolvedValue(0);

    await useCase.execute({ userId: "u1", limit: 5 });

    expect(repo.findByUserId).toHaveBeenCalledWith("u1", 5);
  });
});
