import { PageTitle } from "../atoms/page-title.tsx";
import { DnsConfig } from "../organisms/dns-config.tsx";
import styles from "./dns-page.module.css";

export function DnsPage() {
	return (
		<div className={styles.page}>
			<PageTitle
				title="DNS Configuration"
				description="Manage MagicDNS, nameservers, split DNS, and resolver behavior."
			/>
			<DnsConfig />
		</div>
	);
}
