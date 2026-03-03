import { useDevices } from "../../hooks/use-devices.ts";
import { useDnsPreferences } from "../../hooks/use-dns.ts";
import { useKeys } from "../../hooks/use-keys.ts";
import { getDeviceStatus } from "../../utils/status.ts";
import { expiryLevel } from "../../utils/time.ts";
import { Banner } from "../atoms/banner.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import { StatCard } from "../atoms/stat-card.tsx";
import styles from "./stats-grid.module.css";

export function StatsGrid() {
	const { data: devices, isLoading: devicesLoading } = useDevices();
	const { data: keys, isLoading: keysLoading } = useKeys();
	const { data: dnsPrefs, isLoading: dnsLoading } = useDnsPreferences();

	const isLoading = devicesLoading || keysLoading || dnsLoading;

	if (isLoading) {
		return (
			<div className={styles.grid}>
				{["s1", "s2", "s3", "s4"].map((id) => (
					<Skeleton key={id} height="100px" borderRadius="var(--radius)" />
				))}
			</div>
		);
	}

	const totalDevices = devices?.length ?? 0;
	const onlineDevices =
		devices?.filter((d) => getDeviceStatus(d.lastSeen) === "online").length ?? 0;
	const offlineDevices = totalDevices - onlineDevices;

	const totalKeys = keys?.length ?? 0;
	const expiringKeys =
		keys?.filter((k) => {
			const level = expiryLevel(k.expires);
			return level === "warning" || level === "danger" || level === "critical";
		}).length ?? 0;

	const magicDns = dnsPrefs?.magicDNS ? "Enabled" : "Disabled";

	const expiringCritical =
		keys?.filter((k) => {
			const level = expiryLevel(k.expires);
			return level === "danger" || level === "critical";
		}) ?? [];

	return (
		<div className={styles.container}>
			<div className={styles.grid}>
				<StatCard
					label="Total Devices"
					value={totalDevices}
					sub={`${onlineDevices} online, ${offlineDevices} offline`}
				/>
				<StatCard
					label="Online Ratio"
					value={totalDevices > 0 ? `${Math.round((onlineDevices / totalDevices) * 100)}%` : "—"}
					sub={`${onlineDevices} of ${totalDevices}`}
				/>
				<StatCard label="MagicDNS" value={magicDns} />
				<StatCard
					label="Expiring Keys"
					value={expiringKeys}
					sub={totalKeys > 0 ? `of ${totalKeys} total` : "No keys"}
				/>
			</div>

			{expiringCritical.length > 0 && (
				<Banner variant="danger">
					{expiringCritical.length} key{expiringCritical.length > 1 ? "s" : ""} expiring within 24
					hours: {expiringCritical.map((k) => k.id).join(", ")}
				</Banner>
			)}
		</div>
	);
}
