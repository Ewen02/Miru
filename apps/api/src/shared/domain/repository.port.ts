export interface RepositoryPort<E> {
  findById(id: string): Promise<E | null>;
  save(entity: E): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface PaginatedResult<E> {
  data: E[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface PaginatedQuery {
  page: number;
  pageSize: number;
}
