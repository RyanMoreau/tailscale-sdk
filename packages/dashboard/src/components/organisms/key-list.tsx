import { useCallback, useState } from "react";
import { type Key, useCreateKey, useDeleteKey, useKeys } from "../../hooks/use-keys.ts";
import { expiryLevel } from "../../utils/time.ts";
import { Banner } from "../atoms/banner.tsx";
import { EmptyState } from "../atoms/empty-state.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import { KeyCard } from "../molecules/key-card.tsx";
import { KeyCreateModal } from "./key-create-modal.tsx";
import styles from "./key-list.module.css";

function getHealthBanner(keys: Key[]) {
	const hasExpiring24h = keys.some((k) => {
		const level = expiryLevel(k.expires);
		return level === "danger" || level === "critical";
	});
	const hasExpiring7d = keys.some((k) => expiryLevel(k.expires) === "warning");

	if (hasExpiring24h) return { variant: "danger" as const, msg: "Keys expiring within 24 hours" };
	if (hasExpiring7d) return { variant: "warning" as const, msg: "Keys expiring within 7 days" };
	return { variant: "success" as const, msg: "All keys healthy" };
}

export function KeyList() {
	const { data: keys, isLoading, error } = useKeys();
	const deleteKey = useDeleteKey();
	const createKey = useCreateKey();
	const [modalOpen, setModalOpen] = useState(false);
	const [createdKey, setCreatedKey] = useState<Key | null>(null);

	const handleCreate = useCallback(
		(req: Parameters<typeof createKey.mutate>[0]) => {
			createKey.mutate(req, {
				onSuccess: (key) => {
					setCreatedKey(key);
				},
			});
		},
		[createKey],
	);

	const handleCloseModal = useCallback(() => {
		setModalOpen(false);
		setCreatedKey(null);
	}, []);

	if (isLoading) {
		return (
			<div className={styles.container}>
				<div className={styles.skeletons}>
					{["s1", "s2", "s3"].map((id) => (
						<Skeleton key={id} height="120px" borderRadius="var(--radius)" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return <Banner variant="danger">Failed to load keys: {(error as Error).message}</Banner>;
	}

	const keyList = keys ?? [];
	const health = getHealthBanner(keyList);

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				<Banner variant={health.variant}>{health.msg}</Banner>
				<button type="button" className={styles.createBtn} onClick={() => setModalOpen(true)}>
					+ Create Key
				</button>
			</div>

			{keyList.length === 0 ? (
				<EmptyState
					title="No auth keys"
					description="Create an auth key to register new devices to your tailnet."
					action={
						<button type="button" className={styles.createBtn} onClick={() => setModalOpen(true)}>
							+ Create Key
						</button>
					}
				/>
			) : (
				<div className={styles.grid}>
					{keyList.map((k) => (
						<KeyCard
							key={k.id}
							authKey={k}
							onDelete={(id) => deleteKey.mutate(id)}
							isDeleting={deleteKey.isPending}
						/>
					))}
				</div>
			)}

			<KeyCreateModal
				open={modalOpen}
				onClose={handleCloseModal}
				onCreate={handleCreate}
				isCreating={createKey.isPending}
				createdKey={createdKey}
			/>
		</div>
	);
}
