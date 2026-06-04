import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  AchievementDef,
  UnlockedAchievement,
} from "../../domain/ports/achievement-repository.port";
import { AchievementRepositoryPort } from "../../domain/ports/achievement-repository.port";

@Injectable()
export class PrismaAchievementRepository implements AchievementRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(): Promise<AchievementDef[]> {
    const records = await this.prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toDef(r));
  }

  async listUnlocked(userId: string): Promise<UnlockedAchievement[]> {
    const records = await this.prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      include: { achievement: true },
    });
    return records.map((r) => ({
      ...this.toDef(r.achievement),
      unlockedAt: r.unlockedAt,
    }));
  }

  async unlock(userId: string, achievementCode: string): Promise<boolean> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
      select: { id: true },
    });
    if (!achievement) return false;

    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (existing) return false;

    await this.prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    return true;
  }

  private toDef(record: {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string | null;
    threshold: number | null;
  }): AchievementDef {
    return {
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description,
      icon: record.icon,
      threshold: record.threshold,
    };
  }
}
