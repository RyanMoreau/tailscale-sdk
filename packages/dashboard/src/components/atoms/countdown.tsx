import { useEffect, useState } from "react";
import { type ExpiryLevel, expiryLevel, formatCountdown, timeUntil } from "../../utils/time.ts";
import styles from "./countdown.module.css";

interface CountdownProps {
	expires: string;
}

const levelClass: Record<ExpiryLevel, string> = {
	healthy: styles.healthy || "",
	warning: styles.warning || "",
	danger: styles.danger || "",
	critical: styles.critical || "",
};

export function Countdown({ expires }: CountdownProps) {
	const [remaining, setRemaining] = useState(() => timeUntil(expires));

	useEffect(() => {
		const interval = setInterval(() => {
			setRemaining(timeUntil(expires));
		}, 1000);
		return () => clearInterval(interval);
	}, [expires]);

	const level = expiryLevel(expires);

	return (
		<span className={`${styles.countdown} ${levelClass[level]}`}>{formatCountdown(remaining)}</span>
	);
}
