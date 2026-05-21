import { UserRepositoryPort } from "../ports/user-repository.port";

/**
 * Shared mock factory for UserRepositoryPort. Keeps every use case spec
 * in sync when the port grows new methods — extend here once, all callers
 * pick it up.
 */
export function makeUserRepoMock(): jest.Mocked<UserRepositoryPort> {
  return {
    findById: jest.fn(),
    findByHandle: jest.fn(),
    statsByUserId: jest.fn(),
    favoritesByUserId: jest.fn(),
    reviewsByUserId: jest.fn(),
    joinedAt: jest.fn(),
    isProByUserId: jest.fn(),
    lifetimeStatsByUserId: jest.fn(),
    yearInReviewByUserId: jest.fn(),
    activeSessionsByUserId: jest.fn(),
    revokeSession: jest.fn(),
    preferencesByUserId: jest.fn(),
    updatePreferences: jest.fn(),
    deleteById: jest.fn(),
  };
}
