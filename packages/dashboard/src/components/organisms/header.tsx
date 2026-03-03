import { useLocation } from "react-router";
import styles from "./header.module.css";

const TITLES: Record<string, string> = {
	"/": "Overview",
	"/devices": "Devices",
	"/keys": "Auth Keys",
	"/dns": "DNS Configuration",
	"/acl": "Policy ACL",
};

export function Header() {
	const location = useLocation();
	const path = location.pathname;
	const title =
		TITLES[path] ?? (path.startsWith("/devices/") ? "Device Detail" : "Tailscale Dashboard");

	return (
		<header className={styles.header}>
			<h1 className={styles.title}>{title}</h1>
		</header>
	);
}
