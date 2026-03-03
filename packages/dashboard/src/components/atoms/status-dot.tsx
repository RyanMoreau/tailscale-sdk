import type { DeviceStatus } from "../../utils/status.ts";
import styles from "./status-dot.module.css";

interface StatusDotProps {
	status: DeviceStatus;
}

export function StatusDot({ status }: StatusDotProps) {
	return <span className={`${styles.dot} ${styles[status]}`} title={status} />;
}
