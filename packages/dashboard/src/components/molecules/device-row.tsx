import { useNavigate } from "react-router";
import type { Device } from "../../hooks/use-devices.ts";
import { getDeviceStatus } from "../../utils/status.ts";
import { relativeTime } from "../../utils/time.ts";
import { Badge } from "../atoms/badge.tsx";
import { StatusDot } from "../atoms/status-dot.tsx";
import styles from "./device-row.module.css";

interface DeviceRowProps {
	device: Device;
}

export function DeviceRow({ device }: DeviceRowProps) {
	const navigate = useNavigate();
	const status = getDeviceStatus(device.lastSeen);
	const ip = device.addresses[0] ?? "—";

	return (
		<tr
			className={styles.row}
			onClick={() => navigate(`/devices/${device.id}`)}
			onKeyDown={(e) => e.key === "Enter" && navigate(`/devices/${device.id}`)}
		>
			<td className={styles.cell}>
				<div className={styles.nameCell}>
					<StatusDot status={status} />
					<span className={styles.name}>{device.hostname || device.name}</span>
				</div>
			</td>
			<td className={styles.cell}>
				<span className={styles.os}>{device.os}</span>
			</td>
			<td className={styles.cell}>
				<code className={styles.ip}>{ip}</code>
			</td>
			<td className={styles.cell}>
				<span className={styles.lastSeen}>{relativeTime(device.lastSeen)}</span>
			</td>
			<td className={styles.cell}>
				<div className={styles.tags}>
					{(device.tags || []).slice(0, 3).map((tag) => (
						<Badge key={tag} variant="accent">
							{tag.replace("tag:", "")}
						</Badge>
					))}
					{(device.tags?.length || 0) > 3 && <Badge>+{device.tags?.length - 3}</Badge>}
				</div>
			</td>
			<td className={styles.cell}>
				<Badge variant={status === "online" ? "success" : "default"}>{status}</Badge>
			</td>
		</tr>
	);
}
