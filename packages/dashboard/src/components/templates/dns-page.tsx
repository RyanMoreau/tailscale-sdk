import { DnsConfig } from "../organisms/dns-config.tsx";
import styles from "./dns-page.module.css";

export function DnsPage() {
	return (
		<div className={styles.page}>
			<DnsConfig />
		</div>
	);
}
