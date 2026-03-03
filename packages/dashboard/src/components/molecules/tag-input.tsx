import { useCallback, useState } from "react";
import styles from "./tag-input.module.css";

interface TagInputProps {
	tags: string[];
	onSave: (tags: string[]) => void;
	isSaving: boolean;
}

export function TagInput({ tags = [], onSave, isSaving }: TagInputProps) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState("");

	const handleEdit = useCallback(() => {
		setDraft(tags.join(", "));
		setEditing(true);
	}, [tags]);

	const handleSave = useCallback(() => {
		const newTags = draft
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean)
			.map((t) => (t.startsWith("tag:") ? t : `tag:${t}`));
		onSave(newTags);
		setEditing(false);
	}, [draft, onSave]);

	const handleCancel = useCallback(() => {
		setEditing(false);
	}, []);

	if (editing) {
		return (
			<div className={styles.editContainer}>
				<input
					type="text"
					className={styles.input}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="tag:server, tag:ci"
				/>
				<div className={styles.actions}>
					<button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save"}
					</button>
					<button type="button" className={styles.cancelBtn} onClick={handleCancel}>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.tags}>
				{tags && tags.length > 0 ? (
					tags.map((tag) => (
						<span key={tag} className={styles.tag}>
							{tag}
						</span>
					))
				) : (
					<span className={styles.empty}>No tags</span>
				)}
			</div>
			<button type="button" className={styles.editBtn} onClick={handleEdit}>
				Edit
			</button>
		</div>
	);
}
