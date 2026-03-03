import { useCallback, useState } from "react";
import styles from "./copy-button.module.css";

interface CopyButtonProps {
	text: string;
	label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [text]);

	return (
		<button type="button" className={styles.btn} onClick={handleCopy} title={label}>
			{copied ? "Copied!" : label}
		</button>
	);
}
