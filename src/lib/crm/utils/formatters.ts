import { differenceInCalendarDays, format } from "date-fns";

export function formatPhone(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function formatRelativeTime(date: string | null): string {
  if (!date) return "";
  const days = differenceInCalendarDays(new Date(), new Date(date));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function formatFutureDay(date: string | null): string {
  if (!date) return "";
  const days = differenceInCalendarDays(new Date(date), new Date());
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatLabDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatDate(date: string | null): string {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | null): string {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone;
}
