import { useCallback, useState } from "react";
import type { CreateKeyRequest, Key } from "../../hooks/use-keys.ts";
import { CopyButton } from "../atoms/copy-button.tsx";
import styles from "./key-create-modal.module.css";

interface KeyCreateModalProps {
	open: boolean;
	onClose: () => void;
	onCreate: (req: CreateKeyRequest) => void;
	isCreating: boolean;
	createdKey: Key | null;
}

export function KeyCreateModal({
	open,
	onClose,
	onCreate,
	isCreating,
	createdKey,
}: KeyCreateModalProps) {
	const [reusable, setReusable] = useState(false);
	const [ephemeral, setEphemeral] = useState(false);
	const [preauthorized, setPreauthorized] = useState(false);
	const [tags, setTags] = useState("");
	const [description, setDescription] = useState("");
	const [expiryDays, setExpiryDays] = useState("90");

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const parsedTags = tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
				.map((t) => (t.startsWith("tag:") ? t : `tag:${t}`));

			onCreate({
				capabilities: {
					devices: {
						create: {
							reusable,
							ephemeral,
							preauthorized,
							tags: parsedTags,
						},
					},
				},
				expirySeconds: Number(expiryDays) * 86400,
				description: description || undefined,
			});
		},
		[reusable, ephemeral, preauthorized, tags, description, expiryDays, onCreate],
	);

	if (!open) return null;

	return (
		<>
			<div
				role="presentation"
				className={styles.overlay}
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
			>
				<div
					role="dialog"
					aria-modal="true"
					className={styles.modal}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<div className={styles.header}>
						<h2 className={styles.title}>{createdKey ? "Key Created" : "Create Auth Key"}</h2>
						<button type="button" className={styles.close} onClick={onClose}>
							&times;
						</button>
					</div>

					{createdKey ? (
						<div className={styles.success}>
							<p className={styles.successText}>
								Copy this key now. You won't be able to see it again.
							</p>
							<div className={styles.keyDisplay}>
								<code className={styles.keyValue}>{createdKey.key}</code>
								<CopyButton text={createdKey.key} label="Copy" />
							</div>
							<button type="button" className={styles.doneBtn} onClick={onClose}>
								Done
							</button>
						</div>
					) : (
						<form className={styles.form} onSubmit={handleSubmit}>
							<div className={styles.field}>
								<label className={styles.label} htmlFor="key-description">
									Description
								</label>
								<input
									id="key-description"
									type="text"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="e.g., CI/CD pipeline key"
								/>
							</div>

							<div className={styles.field}>
								<label className={styles.label} htmlFor="key-expiry">
									Expiry (days)
								</label>
								<input
									id="key-expiry"
									type="number"
									min="1"
									max="90"
									value={expiryDays}
									onChange={(e) => setExpiryDays(e.target.value)}
								/>
							</div>

							<div className={styles.field}>
								<label className={styles.label} htmlFor="key-tags">
									Tags (comma-separated)
								</label>
								<input
									id="key-tags"
									type="text"
									value={tags}
									onChange={(e) => setTags(e.target.value)}
									placeholder="tag:server, tag:ci"
								/>
							</div>

							<fieldset className={styles.checkboxGroup}>
								<legend className={styles.label}>Capabilities</legend>
								<label className={styles.checkbox}>
									<input
										type="checkbox"
										checked={reusable}
										onChange={(e) => setReusable(e.target.checked)}
									/>
									<span>Reusable</span>
								</label>
								<label className={styles.checkbox}>
									<input
										type="checkbox"
										checked={ephemeral}
										onChange={(e) => setEphemeral(e.target.checked)}
									/>
									<span>Ephemeral</span>
								</label>
								<label className={styles.checkbox}>
									<input
										type="checkbox"
										checked={preauthorized}
										onChange={(e) => setPreauthorized(e.target.checked)}
									/>
									<span>Preauthorized</span>
								</label>
							</fieldset>

							<button type="submit" className={styles.submitBtn} disabled={isCreating}>
								{isCreating ? "Creating..." : "Create Key"}
							</button>
						</form>
					)}
				</div>
			</div>
		</>
	);
}
