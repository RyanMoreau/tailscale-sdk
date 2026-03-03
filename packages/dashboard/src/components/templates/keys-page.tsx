import { PageTitle } from "../atoms/page-title.tsx";
import { KeyList } from "../organisms/key-list.tsx";
import styles from "./keys-page.module.css";

export function KeysPage() {
	return (
		<div className={styles.page}>
			<PageTitle
				title="Auth Keys"
				description="Create and manage access keys for automation and service authentication."
			/>
			<KeyList />
		</div>
	);
}
