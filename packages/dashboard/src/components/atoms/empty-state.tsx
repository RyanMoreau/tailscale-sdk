import type { ReactNode } from "react";
import styles from "./empty-state.module.css";

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
	return (
		<div className={styles.container}>
			<h3 className={styles.title}>{title}</h3>
			{description && <p className={styles.description}>{description}</p>}
			{action && <div className={styles.action}>{action}</div>}
		</div>
	);
}
