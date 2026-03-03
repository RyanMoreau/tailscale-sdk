import { useCallback, useMemo, useState } from "react";
import { type Device, useDevices } from "../../hooks/use-devices.ts";
import { getDeviceStatus } from "../../utils/status.ts";
import { Banner } from "../atoms/banner.tsx";
import { EmptyState } from "../atoms/empty-state.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import { DeviceRow } from "../molecules/device-row.tsx";
import { FilterBar } from "../molecules/filter-bar.tsx";
import { type SortDirection, SortableHeader } from "../molecules/sortable-header.tsx";
import styles from "./device-table.module.css";

type SortField = "name" | "os" | "ip" | "lastSeen" | "status";

function sortDevices(devices: Device[], field: SortField, dir: SortDirection): Device[] {
	if (!dir) return devices;
	const sorted = [...devices].sort((a, b) => {
		let cmp = 0;
		switch (field) {
			case "name":
				cmp = (a.hostname || a.name).localeCompare(b.hostname || b.name);
				break;
			case "os":
				cmp = a.os.localeCompare(b.os);
				break;
			case "ip":
				cmp = (a.addresses[0] ?? "").localeCompare(b.addresses[0] ?? "");
				break;
			case "lastSeen": {
				const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
				const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
				cmp = aTime - bTime;
				break;
			}
			case "status": {
				const aStatus = getDeviceStatus(a.lastSeen);
				const bStatus = getDeviceStatus(b.lastSeen);
				cmp = aStatus.localeCompare(bStatus);
				break;
			}
		}
		return dir === "asc" ? cmp : -cmp;
	});
	return sorted;
}

export function DeviceTable() {
	const { data: devices, isLoading, error } = useDevices();
	const [filter, setFilter] = useState("");
	const [sortField, setSortField] = useState<SortField | null>(null);
	const [sortDir, setSortDir] = useState<SortDirection>(null);

	const handleSort = useCallback(
		(field: string) => {
			const f = field as SortField;
			if (sortField === f) {
				setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
				if (sortDir === "desc") setSortField(null);
			} else {
				setSortField(f);
				setSortDir("asc");
			}
		},
		[sortField, sortDir],
	);

	const filtered = useMemo(() => {
		if (!devices) return [];
		const q = filter.toLowerCase();
		let result = devices.filter(
			(d) =>
				!q ||
				(d.hostname || d.name).toLowerCase().includes(q) ||
				d.os.toLowerCase().includes(q) ||
				d.addresses.some((a) => a.includes(q)) ||
				d.tags.some((t) => t.toLowerCase().includes(q)),
		);
		if (sortField && sortDir) {
			result = sortDevices(result, sortField, sortDir);
		}
		return result;
	}, [devices, filter, sortField, sortDir]);

	if (isLoading) {
		return (
			<div className={styles.container}>
				{["s1", "s2", "s3", "s4", "s5"].map((id) => (
					<Skeleton key={id} height="3rem" borderRadius="var(--radius-sm)" />
				))}
			</div>
		);
	}

	if (error) {
		return <Banner variant="danger">Failed to load devices: {(error as Error).message}</Banner>;
	}

	return (
		<div className={styles.container}>
			<FilterBar
				value={filter}
				onChange={setFilter}
				placeholder="Filter by name, OS, IP, or tag..."
			/>
			{filtered.length === 0 ? (
				<EmptyState
					title="No devices found"
					description={filter ? "Try adjusting your filter." : "No devices in your tailnet."}
				/>
			) : (
				<div className={styles.tableWrap}>
					<table className={styles.table}>
						<thead>
							<tr>
								<SortableHeader
									label="Name"
									field="name"
									currentSort={sortField}
									direction={sortField === "name" ? sortDir : null}
									onSort={handleSort}
								/>
								<SortableHeader
									label="OS"
									field="os"
									currentSort={sortField}
									direction={sortField === "os" ? sortDir : null}
									onSort={handleSort}
								/>
								<th className={styles.th}>IP</th>
								<SortableHeader
									label="Last Seen"
									field="lastSeen"
									currentSort={sortField}
									direction={sortField === "lastSeen" ? sortDir : null}
									onSort={handleSort}
								/>
								<th className={styles.th}>Tags</th>
								<SortableHeader
									label="Status"
									field="status"
									currentSort={sortField}
									direction={sortField === "status" ? sortDir : null}
									onSort={handleSort}
								/>
							</tr>
						</thead>
						<tbody>
							{filtered.map((device) => (
								<DeviceRow key={device.id} device={device} />
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
