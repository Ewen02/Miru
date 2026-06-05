import { ListEntity } from "../entities/list.entity";

export interface ListSummary {
  id: string;
  userId: string;
  ownerName: string;
  title: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  coverArtSeed: number | null;
  /** Up to 4 cover URLs for the preview tile, in display order. */
  previewCovers: Array<string | null>;
  itemCount: number;
  likeCount: number;
  updatedAt: Date;
}

export interface ListAnimeItem {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  animeYear: number | null;
  animeCoverUrl: string | null;
  animeAverageRating: number | null;
  order: number;
  note: string | null;
  addedAt: Date;
}

export interface ListWithItems {
  list: ListEntity;
  ownerName: string;
  itemCount: number;
  likeCount: number;
  items: ListAnimeItem[];
}

export interface CreateListInput {
  userId: string;
  title: string;
  description?: string | null;
  slug: string;
  isPublic?: boolean;
}

export interface UpdateListInput {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
}

export type ListSort = "popular" | "recent";

export interface ListRepositoryPort {
  findByUserId(userId: string): Promise<ListSummary[]>;
  findLikedByUserId(userId: string): Promise<ListSummary[]>;
  /**
   * Public lists, ordered by `sort`:
   *  - "popular" (default) — likeCount desc, updatedAt desc tiebreak
   *  - "recent" — updatedAt desc
   */
  findPublic(limit: number, sort?: ListSort): Promise<ListSummary[]>;
  /** Same as findPublic('popular') but used by the dedicated /lists/trending page. */
  findTrending(limit: number): Promise<ListSummary[]>;
  findById(id: string): Promise<ListEntity | null>;
  findWithItems(id: string): Promise<ListWithItems | null>;
  create(input: CreateListInput): Promise<ListEntity>;
  update(id: string, input: UpdateListInput): Promise<ListEntity>;
  delete(id: string): Promise<void>;
  addItem(listId: string, animeId: string, note?: string | null): Promise<void>;
  removeItem(listId: string, animeId: string): Promise<void>;
  reorderItems(listId: string, animeIdsInOrder: string[]): Promise<void>;
  like(userId: string, listId: string): Promise<void>;
  unlike(userId: string, listId: string): Promise<void>;
  isLikedBy(userId: string, listId: string): Promise<boolean>;
}
