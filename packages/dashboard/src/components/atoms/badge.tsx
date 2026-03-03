import type { ReactNode } from "react";
import styles from "./badge.module.css";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent";

interface BadgeProps {
	variant?: BadgeVariant;
	children: ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
	return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
