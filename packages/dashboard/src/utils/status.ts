export type DeviceStatus = "online" | "offline";

export function getDeviceStatus(lastSeen: string | null): DeviceStatus {
	if (!lastSeen) return "offline";
	const diff = Date.now() - new Date(lastSeen).getTime();
	// Consider online if seen within the last 15 minutes
	return diff < 15 * 60 * 1000 ? "online" : "offline";
}
