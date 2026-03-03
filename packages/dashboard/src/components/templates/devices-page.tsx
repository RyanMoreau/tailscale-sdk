import { DeviceTable } from "../organisms/device-table.tsx";
import styles from "./devices-page.module.css";

export function DevicesPage() {
	return (
		<div className={styles.page}>
			<DeviceTable />
		</div>
	);
}
