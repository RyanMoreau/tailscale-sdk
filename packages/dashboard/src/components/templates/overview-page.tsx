import { StatsGrid } from "../organisms/stats-grid.tsx";
import styles from "./overview-page.module.css";

export function OverviewPage() {
	return (
		<div className={styles.page}>
			<StatsGrid />
		</div>
	);
}
