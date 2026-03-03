import styles from "./filter-bar.module.css";

interface FilterBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function FilterBar({ value, onChange, placeholder = "Filter..." }: FilterBarProps) {
	return (
		<div className={styles.bar}>
			<input
				type="text"
				className={styles.input}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
			/>
		</div>
	);
}
