import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import type { CalendarWeek } from "@miru/types";
import { GetCalendarWeekUseCase } from "../../application/use-cases/get-calendar-week.use-case";

/**
 * Read-only airing calendar. Accepts a window via ?from=YYYY-MM-DD&to=YYYY-MM-DD.
 * The window is end-exclusive — pass `to = monday next week` to get 7 days.
 */
@Controller("calendar")
export class CalendarController {
  constructor(private readonly getCalendarWeek: GetCalendarWeekUseCase) {}

  @Get()
  async week(
    @Query("from") fromStr?: string,
    @Query("to") toStr?: string,
  ): Promise<CalendarWeek> {
    if (!fromStr || !toStr) {
      throw new BadRequestException("from and to query params are required (YYYY-MM-DD)");
    }
    const from = parseDate(fromStr, "from");
    const to = parseDate(toStr, "to");
    if (to <= from) {
      throw new BadRequestException("to must be strictly after from");
    }

    const { episodes } = await this.getCalendarWeek.execute({ from, to });

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      episodes: episodes.map((e) => ({
        animeId: e.animeId,
        animeSlug: e.animeSlug,
        animeTitle: e.animeTitle,
        studioName: e.studioName,
        coverUrl: e.coverUrl,
        episodeCount: e.episodeCount,
        episodeNumber: e.episodeNumber,
        episodeTitle: e.episodeTitle,
        airedAt: e.airedAt.toISOString(),
      })),
    };
  }
}

function parseDate(value: string, label: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`${label} is not a valid date`);
  }
  return d;
}
