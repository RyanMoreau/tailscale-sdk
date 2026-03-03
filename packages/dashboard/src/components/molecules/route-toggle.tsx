import styles from "./route-toggle.module.css";

interface RouteToggleProps {
	route: string;
	enabled: boolean;
	onToggle: (route: string, enabled: boolean) => void;
	disabled?: boolean;
}

export function RouteToggle({ route, enabled, onToggle, disabled }: RouteToggleProps) {
	return (
		<label className={styles.container}>
			<input
				type="checkbox"
				className={styles.checkbox}
				checked={enabled}
				onChange={(e) => onToggle(route, e.target.checked)}
				disabled={disabled}
			/>
			<code className={styles.route}>{route}</code>
			<span className={`${styles.status} ${enabled ? styles.enabled : styles.disabled}`}>
				{enabled ? "Enabled" : "Disabled"}
			</span>
		</label>
	);
}
