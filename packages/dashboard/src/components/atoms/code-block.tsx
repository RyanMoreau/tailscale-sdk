import styles from "./code-block.module.css";
import { CopyButton } from "./copy-button.tsx";

interface CodeBlockProps {
	code: string;
	language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				{language && <span className={styles.lang}>{language}</span>}
				<CopyButton text={code} />
			</div>
			<pre className={styles.pre}>
				<code>{code}</code>
			</pre>
		</div>
	);
}
