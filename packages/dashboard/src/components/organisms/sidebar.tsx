import { Globe, Home, KeyRound, Laptop, Menu, Shield, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { NavItem } from "../molecules/nav-item.tsx";
import styles from "./sidebar.module.css";

const NAV_ITEMS = [
	{ to: "/", icon: Home, label: "Home" },
	{ to: "/devices", icon: Laptop, label: "My Devices" },
	{ to: "/users", icon: Users, label: "Users" },
	{ to: "/keys", icon: KeyRound, label: "Access Keys" },
	{ to: "/dns", icon: Globe, label: "Network Settings" },
	{ to: "/acl", icon: Shield, label: "Access Control" },
];

export function Sidebar() {
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		setMenuOpen(false);
	}, []);

	const isActive = (to: string) =>
		to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

	const mobileDockItems = [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[4]];

	return (
		<>
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

			<div className={styles.mobileDock}>
				<Link to="/" className={styles.mobileBrand} aria-label="Go to home">
					<span className={styles.mobileBrandLogo}>TS</span>
				</Link>
				<nav className={styles.mobileDockNav} aria-label="Quick navigation">
					{mobileDockItems.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.to}
								to={item.to}
								className={`${styles.mobileDockItem} ${isActive(item.to) ? styles.mobileDockItemActive : ""}`}
								aria-label={item.label}
							>
								<Icon size={18} />
							</Link>
						);
					})}
				</nav>
				<button
					type="button"
					className={styles.mobileMenuButton}
					onClick={() => setMenuOpen((open) => !open)}
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					aria-expanded={menuOpen}
				>
					{menuOpen ? <X size={18} /> : <Menu size={18} />}
				</button>
			</div>

			<button
				type="button"
				className={`${styles.mobileBackdrop} ${menuOpen ? styles.mobileBackdropOpen : ""}`}
				onClick={() => setMenuOpen(false)}
				aria-label="Close menu backdrop"
			/>

			<div className={`${styles.mobileSheet} ${menuOpen ? styles.mobileSheetOpen : ""}`}>
				<div className={styles.mobileSheetHeader}>
					<span className={styles.mobileSheetTitle}>Navigate</span>
					<button
						type="button"
						className={styles.mobileSheetClose}
						onClick={() => setMenuOpen(false)}
						aria-label="Close navigation menu"
					>
						<X size={18} />
					</button>
				</div>
				<nav className={styles.mobileSheetNav} aria-label="Mobile navigation">
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.to}
								to={item.to}
								className={`${styles.mobileSheetItem} ${isActive(item.to) ? styles.mobileSheetItemActive : ""}`}
							>
								<Icon size={18} />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>
		</>
	);
}
