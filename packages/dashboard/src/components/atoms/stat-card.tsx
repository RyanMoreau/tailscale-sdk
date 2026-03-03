import type { ReactNode } from "react";
import styles from "./stat-card.module.css";

interface StatCardProps {
	label: string;
	value: ReactNode;
	sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
	return (
		<div className={styles.card}>
			<span className={styles.label}>{label}</span>
			<span className={styles.value}>{value}</span>
			{sub && <span className={styles.sub}>{sub}</span>}
		</div>
	);
}
