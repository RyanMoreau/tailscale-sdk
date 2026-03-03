import { useParams } from "react-router";
import { DeviceInfo } from "../organisms/device-info.tsx";
import styles from "./device-detail-page.module.css";

export function DeviceDetailPage() {
	const { id } = useParams<{ id: string }>();

	if (!id) return null;

	return (
		<div className={styles.page}>
			<DeviceInfo deviceId={id} />
		</div>
	);
}
