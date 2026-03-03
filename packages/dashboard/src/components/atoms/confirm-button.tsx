import { useCallback, useState } from "react";
import styles from "./confirm-button.module.css";

interface ConfirmButtonProps {
	label: string;
	confirmLabel?: string;
	variant?: "danger" | "default";
	onConfirm: () => void;
	disabled?: boolean;
}

export function ConfirmButton({
	label,
	confirmLabel = "Confirm?",
	variant = "default",
	onConfirm,
	disabled,
}: ConfirmButtonProps) {
	const [confirming, setConfirming] = useState(false);

	const handleClick = useCallback(() => {
		if (confirming) {
			onConfirm();
			setConfirming(false);
		} else {
			setConfirming(true);
			setTimeout(() => setConfirming(false), 3000);
		}
	}, [confirming, onConfirm]);

	return (
		<button
			type="button"
			className={`${styles.btn} ${confirming ? styles.confirming : ""} ${variant === "danger" ? styles.danger : ""}`}
			onClick={handleClick}
			disabled={disabled}
		>
			{confirming ? confirmLabel : label}
		</button>
	);
}
