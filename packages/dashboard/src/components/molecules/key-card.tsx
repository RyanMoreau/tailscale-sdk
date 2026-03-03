import type { Key } from "../../hooks/use-keys.ts";
import { type ExpiryLevel, expiryLevel } from "../../utils/time.ts";
import { ConfirmButton } from "../atoms/confirm-button.tsx";
import { CopyButton } from "../atoms/copy-button.tsx";
import { ExpiryIndicator } from "./expiry-indicator.tsx";
import styles from "./key-card.module.css";

interface KeyCardProps {
	authKey: Key;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

const levelBorder: Record<ExpiryLevel, string> = {
	healthy: styles.borderHealthy || "",
	warning: styles.borderWarning || "",
	danger: styles.borderDanger || "",
	critical: styles.borderCritical || "",
};

export function KeyCard({ authKey, onDelete, isDeleting }: KeyCardProps) {
	const level = expiryLevel(authKey.expires);
	const caps = authKey.capabilities?.devices?.create;

	return (
		<div className={`${styles.card} ${levelBorder[level]}`}>
			<div className={styles.header}>
				<div className={styles.idRow}>
					<code className={styles.id}>{authKey.id}</code>
					<CopyButton text={authKey.id} label="Copy ID" />
				</div>
				<ExpiryIndicator expires={authKey.expires} />
			</div>

			{authKey.description && <p className={styles.description}>{authKey.description}</p>}

			<div className={styles.meta}>
				<div className={styles.capabilities}>
					{caps?.reusable && <span className={styles.cap}>Reusable</span>}
					{caps?.ephemeral && <span className={styles.cap}>Ephemeral</span>}
					{caps?.preauthorized && <span className={styles.cap}>Preauthorized</span>}
					{caps?.tags?.map((tag) => (
						<span key={tag} className={styles.tag}>
							{tag}
						</span>
					))}
				</div>

				<ConfirmButton
					label="Revoke"
					confirmLabel="Confirm revoke?"
					variant="danger"
					onConfirm={() => onDelete(authKey.id)}
					disabled={isDeleting}
				/>
			</div>

			{authKey.key && authKey.key !== authKey.id && (
				<div className={styles.keyValue}>
					<code className={styles.fullKey}>{authKey.key}</code>
					<CopyButton text={authKey.key} label="Copy Key" />
				</div>
			)}
		</div>
	);
}
