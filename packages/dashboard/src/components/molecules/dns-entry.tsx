import styles from "./dns-entry.module.css";

interface DnsEntryProps {
	label: string;
	values: string[];
}

export function DnsEntry({ label, values }: DnsEntryProps) {
	return (
		<div className={styles.entry}>
			<span className={styles.label}>{label}</span>
			<div className={styles.values}>
				{values.length > 0 ? (
					values.map((v) => (
						<code key={v} className={styles.value}>
							{v}
						</code>
					))
				) : (
					<span className={styles.empty}>None configured</span>
				)}
			</div>
		</div>
	);
}
