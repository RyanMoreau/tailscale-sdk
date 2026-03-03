import { AclDisplay } from "../organisms/acl-display.tsx";
import styles from "./acl-page.module.css";

export function AclPage() {
	return (
		<div className={styles.page}>
			<AclDisplay />
		</div>
	);
}
