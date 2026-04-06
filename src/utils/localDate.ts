/** Calendar date in the user's local timezone as `YYYY-MM-DD` (avoids UTC day shift from `toISOString()`). */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Safe locale display for API date strings (e.g. `member_since`). */
export function formatDisplayDate(value: string | null | undefined): string {
  const s = value?.trim();
  if (!s) return "—";
  const t = Date.parse(s.length <= 10 ? `${s}T12:00:00` : s);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleDateString();
}
