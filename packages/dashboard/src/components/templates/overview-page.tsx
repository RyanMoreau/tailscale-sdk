import { PageTitle } from "../atoms/page-title.tsx";
import { OperatorOverview } from "../organisms/operator-overview.tsx";
import styles from "./overview-page.module.css";

export function OverviewPage() {
	return (
		<div className={styles.page}>
			<PageTitle
				title="Overview"
				description="Operator-focused dashboard for high-confidence actions during day-to-day ops and incidents."
			/>
			<OperatorOverview />
		</div>
	);
}
