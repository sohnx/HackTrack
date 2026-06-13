// frontend/utils/date.ts

export function formatDate(date: string | null): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function daysUntil(date: string | null): number | null {
    if (!date) return null;
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(date: string | null): string {
    const days = daysUntil(date);
    if (days === null) return "No deadline";
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days}d left`;
}

export function isUrgent(date: string | null): boolean {
    const days = daysUntil(date);
    return days !== null && days >= 0 && days <= 3;
}