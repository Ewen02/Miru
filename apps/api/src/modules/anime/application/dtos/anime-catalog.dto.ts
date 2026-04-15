import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from "class-validator";
import { Transform, Type } from "class-transformer";
import { AnimeStatus, AnimeFormat } from "@miru/types";

export class AnimeCatalogQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @IsOptional()
  @IsEnum(AnimeFormat)
  format?: AnimeFormat;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;
}
