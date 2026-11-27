const pad = (n: number) => String(n).padStart(2, '0');

/** 05.11.2026 14:30 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 05.11.2026 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** 14:30 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Сегодня, 14:30" / "Вчера, 09:00" / "05.11.2026, 14:30" */
export function formatRelativeDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (diffDays === 0) return `Сегодня, ${time}`;
  if (diffDays === 1) return `Вчера, ${time}`;
  return `${formatDate(iso)}, ${time}`;
}

/** Значение для input[type=datetime-local] в локальном часовом поясе. */
export function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** ISO-строка начала дня (локальная). */
export function startOfDayISO(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  return x.toISOString();
}

/** ISO-строка конца дня (локальная). */
export function endOfDayISO(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return x.toISOString();
}

/** Короткая метка для оси X графика. */
export function chartTickLabel(iso: string, spanDays: number): string {
  const d = new Date(iso);
  if (spanDays <= 1) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (spanDays <= 31) return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}
