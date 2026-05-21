import { ListRepositoryPort } from "../ports/list-repository.port";

export function makeListRepoMock(): jest.Mocked<ListRepositoryPort> {
  return {
    findByUserId: jest.fn(),
    findLikedByUserId: jest.fn(),
    findPublic: jest.fn(),
    findById: jest.fn(),
    findWithItems: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addItem: jest.fn(),
    removeItem: jest.fn(),
    reorderItems: jest.fn(),
    like: jest.fn(),
    unlike: jest.fn(),
    isLikedBy: jest.fn(),
  };
}
