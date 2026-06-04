import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class AddReactionDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(14_400)
  secondMark!: number;

  @IsIn(["love", "laugh", "cry", "shock", "fire"])
  kind!: string;
}

export class HeatmapQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(300)
  bucketSeconds?: number;
}
