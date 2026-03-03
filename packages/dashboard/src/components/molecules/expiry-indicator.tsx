import { type ExpiryLevel, expiryLevel } from "../../utils/time.ts";
import { Badge } from "../atoms/badge.tsx";
import { Countdown } from "../atoms/countdown.tsx";
import styles from "./expiry-indicator.module.css";

interface ExpiryIndicatorProps {
	expires: string;
}

const levelVariant: Record<ExpiryLevel, "success" | "warning" | "danger"> = {
	healthy: "success",
	warning: "warning",
	danger: "danger",
	critical: "danger",
};

const levelLabel: Record<ExpiryLevel, string> = {
	healthy: "Healthy",
	warning: "Expiring Soon",
	danger: "Expiring",
	critical: "Critical",
};

export function ExpiryIndicator({ expires }: ExpiryIndicatorProps) {
	const level = expiryLevel(expires);

	return (
		<div className={styles.container}>
			<Badge variant={levelVariant[level]}>{levelLabel[level]}</Badge>
			<Countdown expires={expires} />
		</div>
	);
}
