import { NavItem } from "../molecules/nav-item.tsx";
import styles from "./sidebar.module.css";

const NAV_ITEMS = [
	{ to: "/", icon: "\u25A3", label: "Overview" },
	{ to: "/devices", icon: "\u2630", label: "Devices" },
	{ to: "/keys", icon: "\u26BF", label: "Auth Keys" },
	{ to: "/dns", icon: "\u29BF", label: "DNS" },
	{ to: "/acl", icon: "\u2263", label: "Policy ACL" },
];

export function Sidebar() {
	return (
		<aside className={styles.sidebar}>
			<div className={styles.brand}>
				<span className={styles.logo}>TS</span>
				<span className={styles.title}>Tailscale</span>
			</div>
			<nav className={styles.nav}>
				{NAV_ITEMS.map((item) => (
					<NavItem key={item.to} {...item} />
				))}
			</nav>
			<div className={styles.footer}>
				<span className={styles.footerText}>SDK Dashboard v0.1</span>
			</div>
		</aside>
	);
}
