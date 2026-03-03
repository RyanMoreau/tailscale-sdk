import { useCallback, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type Key, useCreateKey, useDeleteKey, useKeys } from "../../hooks/use-keys.ts";
import { expiryLevel } from "../../utils/time.ts";
import { Banner } from "../atoms/banner.tsx";
import { EmptyState } from "../atoms/empty-state.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import { KeyCard } from "../molecules/key-card.tsx";
import { KeyCreateModal } from "./key-create-modal.tsx";
import styles from "./key-list.module.css";

type HorizonPoint = { label: string; count: number };

function buildExpiryHorizon(keys: Key[]): HorizonPoint[] {
	const now = Date.now();
	const dayMs = 24 * 60 * 60 * 1000;
	const bucketCounts = {
		"24h": 0,
		"3d": 0,
		"7d": 0,
		"14d": 0,
		"30d": 0,
		"30d+": 0,
	};

	for (const key of keys) {
		const expires = Date.parse(key.expires);
		if (!Number.isFinite(expires)) continue;
		const daysLeft = (expires - now) / dayMs;
		if (daysLeft <= 1) bucketCounts["24h"] += 1;
		else if (daysLeft <= 3) bucketCounts["3d"] += 1;
		else if (daysLeft <= 7) bucketCounts["7d"] += 1;
		else if (daysLeft <= 14) bucketCounts["14d"] += 1;
		else if (daysLeft <= 30) bucketCounts["30d"] += 1;
		else bucketCounts["30d+"] += 1;
	}

	return [
		{ label: "24h", count: bucketCounts["24h"] },
		{ label: "3d", count: bucketCounts["3d"] },
		{ label: "7d", count: bucketCounts["7d"] },
		{ label: "14d", count: bucketCounts["14d"] },
		{ label: "30d", count: bucketCounts["30d"] },
		{ label: "30d+", count: bucketCounts["30d+"] },
	];
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
	const horizon = buildExpiryHorizon(keyList);
	const urgentCount = keyList.filter((k) => {
		const level = expiryLevel(k.expires);
		return level === "danger" || level === "critical";
	}).length;
	const warningCount = keyList.filter((k) => expiryLevel(k.expires) === "warning").length;
	const healthyCount = Math.max(keyList.length - urgentCount - warningCount, 0);
	const totalKeys = keyList.length;
	const latestKey = keyList.reduce<string | null>((latest, key) => {
		const keyDate = Date.parse(key.created);
		if (!Number.isFinite(keyDate)) return latest;
		if (!latest) return key.created;
		const latestDate = Date.parse(latest);
		if (!Number.isFinite(latestDate) || keyDate > latestDate) return key.created;
		return latest;
	}, null);
	const createdLabel = latestKey
		? new Date(latestKey).toLocaleDateString(undefined, { month: "short", day: "numeric" })
		: "—";
	const horizonMax = Math.max(...horizon.map((point) => point.count), 1);

	return (
		<div className={styles.container}>
			{createKey.error && (
				<Banner variant="danger">
					Failed to create key: {(createKey.error as Error).message}
				</Banner>
			)}
			{deleteKey.error && (
				<Banner variant="danger">
					Failed to delete key: {(deleteKey.error as Error).message}
				</Banner>
			)}
			<div className={styles.toolbar}>
				<div className={styles.horizonCard}>
					<div className={styles.horizonHeader}>
						<div>
							<p className={styles.horizonTitle}>Key Health Overview</p>
							<p className={styles.horizonSubtext}>Distribution by expiry window</p>
						</div>
						<button type="button" className={styles.createBtn} onClick={() => setModalOpen(true)}>
							+ Create Key
						</button>
					</div>
					<div className={styles.summaryGrid}>
						<div className={styles.metricCard}>
							<p className={styles.metricLabel}>Total keys</p>
							<p className={styles.metricValue}>{totalKeys}</p>
						</div>
						<div className={styles.metricCard}>
							<p className={styles.metricLabel}>Urgent</p>
							<p className={`${styles.metricValue} ${styles.metricDanger}`}>{urgentCount}</p>
						</div>
						<div className={styles.metricCard}>
							<p className={styles.metricLabel}>Warning</p>
							<p className={`${styles.metricValue} ${styles.metricWarning}`}>{warningCount}</p>
						</div>
						<div className={styles.metricCard}>
							<p className={styles.metricLabel}>Newest key</p>
							<p className={styles.metricValue}>{createdLabel}</p>
						</div>
					</div>
					<div className={styles.chartWrap}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={horizon} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
								<CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.28)" />
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
								/>
								<YAxis
									domain={[0, horizonMax]}
									allowDecimals={false}
									tickLine={false}
									axisLine={false}
									tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
								/>
								<Tooltip
									cursor={{ fill: "hsl(var(--muted) / 0.18)" }}
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										borderColor: "hsl(var(--border))",
									}}
									labelStyle={{ color: "hsl(var(--muted-foreground))" }}
									itemStyle={{ color: "hsl(var(--foreground))" }}
								/>
								<Bar dataKey="count" radius={6}>
									{horizon.map((point) => (
										<Cell
											key={point.label}
											fill={point.label === "24h" ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className={styles.horizonChips}>
						<span className={styles.chipDanger}>{urgentCount} urgent</span>
						<span className={styles.chipWarning}>{warningCount} warning</span>
						<span className={styles.chipHealthy}>{healthyCount} healthy</span>
					</div>
				</div>
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
