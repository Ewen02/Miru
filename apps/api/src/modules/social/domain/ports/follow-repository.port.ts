export interface FollowRepositoryPort {
  follow(followerId: string, followingId: string): Promise<void>;
  unfollow(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  countFollowers(userId: string): Promise<number>;
  countFollowing(userId: string): Promise<number>;
  /** Ids of users that `userId` follows. */
  listFollowing(userId: string): Promise<string[]>;
}
