import { useCallback } from "react";
import { useNavigate } from "react-router";
import {
	useAuthorizeDevice,
	useDeleteDevice,
	useDevice,
	useDeviceRoutes,
	useSetDeviceRoutes,
	useSetDeviceTags,
} from "../../hooks/use-devices.ts";
import { getDeviceStatus } from "../../utils/status.ts";
import { relativeTime } from "../../utils/time.ts";
import { Badge } from "../atoms/badge.tsx";
import { Banner } from "../atoms/banner.tsx";
import { ConfirmButton } from "../atoms/confirm-button.tsx";
import { Countdown } from "../atoms/countdown.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import { StatusDot } from "../atoms/status-dot.tsx";
import { RouteToggle } from "../molecules/route-toggle.tsx";
import { TagInput } from "../molecules/tag-input.tsx";
import styles from "./device-info.module.css";

interface DeviceInfoProps {
	deviceId: string;
}

export function DeviceInfo({ deviceId }: DeviceInfoProps) {
	const navigate = useNavigate();
	const { data: device, isLoading, error } = useDevice(deviceId);
	const { data: routes } = useDeviceRoutes(deviceId);
	const authorize = useAuthorizeDevice();
	const setTags = useSetDeviceTags();
	const setRoutes = useSetDeviceRoutes();
	const deleteDevice = useDeleteDevice();

	const handleToggleRoute = useCallback(
		(route: string, enabled: boolean) => {
			if (!routes) return;
			const newEnabled = enabled
				? [...routes.enabledRoutes, route]
				: routes.enabledRoutes.filter((r) => r !== route);
			setRoutes.mutate({ id: deviceId, routes: newEnabled });
		},
		[deviceId, routes, setRoutes],
	);

	const handleDelete = useCallback(() => {
		deleteDevice.mutate(deviceId, {
			onSuccess: () => navigate("/devices"),
		});
	}, [deviceId, deleteDevice, navigate]);

	if (isLoading) {
		return (
			<div className={styles.container}>
				<Skeleton height="200px" borderRadius="var(--radius)" />
			</div>
		);
	}

	if (error || !device) {
		return (
			<Banner variant="danger">
				Failed to load device: {error ? (error as Error).message : "Not found"}
			</Banner>
		);
	}

	const status = getDeviceStatus(device.lastSeen);
	const ip = device.addresses[0] ?? "—";

	return (
		<div className={styles.container}>
			<button type="button" className={styles.back} onClick={() => navigate("/devices")}>
				&larr; Back to devices
			</button>

			<div className={styles.header}>
				<div className={styles.titleRow}>
					<StatusDot status={status} />
					<h2 className={styles.name}>{device.hostname || device.name}</h2>
					<Badge variant={status === "online" ? "success" : "default"}>{status}</Badge>
				</div>
				<div className={styles.actions}>
					{!device.authorized && (
						<button
							type="button"
							className={styles.authorizeBtn}
							onClick={() => authorize.mutate({ id: deviceId, authorized: true })}
							disabled={authorize.isPending}
						>
							{authorize.isPending ? "Authorizing..." : "Authorize"}
						</button>
					)}
					<ConfirmButton
						label="Delete Device"
						confirmLabel="Confirm delete?"
						variant="danger"
						onConfirm={handleDelete}
						disabled={deleteDevice.isPending}
					/>
				</div>
			</div>

			<div className={styles.grid}>
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Details</h3>
					<dl className={styles.details}>
						<div className={styles.detailRow}>
							<dt>Tailscale IP</dt>
							<dd>
								<code>{ip}</code>
							</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>OS</dt>
							<dd>{device.os}</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>Client Version</dt>
							<dd>{device.clientVersion || "—"}</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>Last Seen</dt>
							<dd>{relativeTime(device.lastSeen)}</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>Created</dt>
							<dd>{new Date(device.created).toLocaleDateString()}</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>Key Expiry</dt>
							<dd>
								{device.keyExpiryDisabled ? (
									<Badge variant="success">Disabled</Badge>
								) : (
									<Countdown expires={device.expires} />
								)}
							</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>Authorized</dt>
							<dd>
								<Badge variant={device.authorized ? "success" : "warning"}>
									{device.authorized ? "Yes" : "No"}
								</Badge>
							</dd>
						</div>
						<div className={styles.detailRow}>
							<dt>User</dt>
							<dd>{device.user}</dd>
						</div>
						{device.isEphemeral && (
							<div className={styles.detailRow}>
								<dt>Ephemeral</dt>
								<dd>
									<Badge variant="accent">Yes</Badge>
								</dd>
							</div>
						)}
						{device.updateAvailable && (
							<div className={styles.detailRow}>
								<dt>Update</dt>
								<dd>
									<Badge variant="warning">Available</Badge>
								</dd>
							</div>
						)}
					</dl>
				</div>

				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Tags</h3>
					<TagInput
						tags={device.tags}
						onSave={(tags) => setTags.mutate({ id: deviceId, tags })}
						isSaving={setTags.isPending}
					/>
				</div>

				{routes && routes.advertisedRoutes.length > 0 && (
					<div className={styles.section}>
						<h3 className={styles.sectionTitle}>Routes</h3>
						<div className={styles.routes}>
							{routes.advertisedRoutes.map((route) => (
								<RouteToggle
									key={route}
									route={route}
									enabled={routes.enabledRoutes.includes(route)}
									onToggle={handleToggleRoute}
									disabled={setRoutes.isPending}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
