import { PageTitle } from "../atoms/page-title.tsx";
import { DeviceTable } from "../organisms/device-table.tsx";
import styles from "./devices-page.module.css";

export function DevicesPage() {
	return (
		<div className={styles.page}>
			<PageTitle
				title="Devices"
				description="Search, filter, and inspect machines connected to your tailnet."
			/>
			<DeviceTable />
		</div>
	);
}
