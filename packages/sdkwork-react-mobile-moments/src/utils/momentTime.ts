export function formatMomentRelativeTime(timestamp: number, now: number = Date.now()): string {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const diff = Math.max(0, now - timestamp);

  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} h ago`;
  return `${Math.floor(diff / day)} d ago`;
}
