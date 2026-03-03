import type { ReactNode } from "react";
import styles from "./banner.module.css";

type BannerVariant = "info" | "success" | "warning" | "danger";

interface BannerProps {
	variant?: BannerVariant;
	children: ReactNode;
}

export function Banner({ variant = "info", children }: BannerProps) {
	return <div className={`${styles.banner} ${styles[variant]}`}>{children}</div>;
}
