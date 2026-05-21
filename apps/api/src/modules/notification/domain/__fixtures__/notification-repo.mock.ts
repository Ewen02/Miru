import { NotificationRepositoryPort } from "../ports/notification-repository.port";

export function makeNotificationRepoMock(): jest.Mocked<NotificationRepositoryPort> {
  return {
    findByUserId: jest.fn(),
    unreadCountByUserId: jest.fn(),
    create: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  };
}
