export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function formatDateRange(from: Date, to: Date): string {
  const last = addDays(to, -1);
  const sameMonth = from.getMonth() === last.getMonth();
  if (sameMonth) {
    return `${from.getDate()} – ${last.getDate()} ${last.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
  }
  return `${from.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${last.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function timeZoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "local";
  } catch {
    return "local";
  }
}

/** AniList seasons: WINTER Jan-Mar, SPRING Apr-Jun, SUMMER Jul-Sep, FALL Oct-Dec. */
export function currentSeasonLabel(date: Date = new Date()): string {
  const seasons = ["hiver", "printemps", "été", "automne"];
  const name = seasons[Math.floor(date.getMonth() / 3)];
  return `${name} ${date.getFullYear()}`;
}
