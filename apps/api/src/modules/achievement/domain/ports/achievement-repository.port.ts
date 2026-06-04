/** A catalog achievement definition (independent of any user). */
export interface AchievementDef {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  threshold: number | null;
}

/** An achievement a given user has unlocked, with the unlock timestamp. */
export interface UnlockedAchievement extends AchievementDef {
  unlockedAt: Date;
}

export interface AchievementRepositoryPort {
  listAll(): Promise<AchievementDef[]>;
  listUnlocked(userId: string): Promise<UnlockedAchievement[]>;
  /** Returns false if already unlocked or the code is unknown. */
  unlock(userId: string, achievementCode: string): Promise<boolean>;
}
