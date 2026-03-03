import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import styles from "./nav-item.module.css";

interface NavItemProps {
	to: string;
	icon: LucideIcon;
	label: string;
}

export function NavItem({ to, icon, label }: NavItemProps) {
	const location = useLocation();
	const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
	const Icon = icon;

	return (
		<Link to={to} className={`${styles.item} ${isActive ? styles.active : ""}`}>
			<span className={styles.icon}>
				<Icon size={18} />
			</span>
			<span className={styles.label}>{label}</span>
		</Link>
	);
}
