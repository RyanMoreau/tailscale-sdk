import { Link, useLocation } from "react-router";
import styles from "./nav-item.module.css";

interface NavItemProps {
	to: string;
	icon: string;
	label: string;
}

export function NavItem({ to, icon, label }: NavItemProps) {
	const location = useLocation();
	const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

	return (
		<Link to={to} className={`${styles.item} ${isActive ? styles.active : ""}`}>
			<span className={styles.icon}>{icon}</span>
			<span className={styles.label}>{label}</span>
		</Link>
	);
}
