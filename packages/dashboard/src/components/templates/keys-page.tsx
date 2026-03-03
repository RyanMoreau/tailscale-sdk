import { KeyList } from "../organisms/key-list.tsx";
import styles from "./keys-page.module.css";

export function KeysPage() {
	return (
		<div className={styles.page}>
			<KeyList />
		</div>
	);
}
