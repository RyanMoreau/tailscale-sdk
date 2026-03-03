import styles from "./sortable-header.module.css";

export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
	label: string;
	field: string;
	currentSort: string | null;
	direction: SortDirection;
	onSort: (field: string) => void;
}

export function SortableHeader({
	label,
	field,
	currentSort,
	direction,
	onSort,
}: SortableHeaderProps) {
	const isActive = currentSort === field;
	const arrow = isActive ? (direction === "asc" ? " \u2191" : " \u2193") : "";

	return (
		<th
			className={styles.th}
			onClick={() => onSort(field)}
			onKeyDown={(e) => e.key === "Enter" && onSort(field)}
		>
			<span className={`${styles.label} ${isActive ? styles.active : ""}`}>
				{label}
				{arrow}
			</span>
		</th>
	);
}
