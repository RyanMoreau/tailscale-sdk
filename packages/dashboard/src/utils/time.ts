export function relativeTime(dateStr: string | null): string {
	if (!dateStr) return "Never";

	const date = new Date(dateStr);
	const now = Date.now();
	const diffMs = now - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "Just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay < 30) return `${diffDay}d ago`;
	return date.toLocaleDateString();
}

export interface TimeRemaining {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	totalMs: number;
	expired: boolean;
}

export function timeUntil(dateStr: string): TimeRemaining {
	const target = new Date(dateStr).getTime();
	const now = Date.now();
	const totalMs = target - now;

	if (totalMs <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true };
	}

	const totalSec = Math.floor(totalMs / 1000);
	const days = Math.floor(totalSec / 86400);
	const hours = Math.floor((totalSec % 86400) / 3600);
	const minutes = Math.floor((totalSec % 3600) / 60);
	const seconds = totalSec % 60;

	return { days, hours, minutes, seconds, totalMs, expired: false };
}

export function formatCountdown(remaining: TimeRemaining): string {
	if (remaining.expired) return "Expired";
	if (remaining.days > 0) return `${remaining.days}d ${remaining.hours}h`;
	if (remaining.hours > 0) return `${remaining.hours}h ${remaining.minutes}m`;
	if (remaining.minutes > 0) return `${remaining.minutes}m ${remaining.seconds}s`;
	return `${remaining.seconds}s`;
}

export type ExpiryLevel = "healthy" | "warning" | "danger" | "critical";

export function expiryLevel(dateStr: string): ExpiryLevel {
	const { totalMs, expired } = timeUntil(dateStr);
	if (expired) return "critical";
	if (totalMs < 3_600_000) return "critical"; // < 1h
	if (totalMs < 86_400_000) return "danger"; // < 24h
	if (totalMs < 604_800_000) return "warning"; // < 7d
	return "healthy";
}
