import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

const FORUM_CATEGORIES = ["GENERAL", "RECOMMENDATIONS", "NEWS", "HELP", "OFFTOPIC"];

export class CreateThreadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsIn(FORUM_CATEGORIES)
  category!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}

export class ThreadsQueryDto {
  @IsOptional()
  @IsIn(FORUM_CATEGORIES)
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
