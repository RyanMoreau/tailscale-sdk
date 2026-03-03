import {
	useDnsPreferences,
	useNameservers,
	useSearchPaths,
	useSplitDns,
} from "../../hooks/use-dns.ts";
import { Badge } from "../atoms/badge.tsx";
import { Banner } from "../atoms/banner.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import { DnsEntry } from "../molecules/dns-entry.tsx";
import styles from "./dns-config.module.css";

export function DnsConfig() {
	const { data: nameservers, isLoading: nsLoading, error: nsError } = useNameservers();
	const { data: searchPaths, isLoading: spLoading } = useSearchPaths();
	const { data: splitDns, isLoading: sdLoading } = useSplitDns();
	const { data: prefs, isLoading: prefsLoading } = useDnsPreferences();

	const isLoading = nsLoading || spLoading || sdLoading || prefsLoading;

	if (isLoading) {
		return (
			<div className={styles.container}>
				{["s1", "s2", "s3", "s4"].map((id) => (
					<Skeleton key={id} height="80px" borderRadius="var(--radius)" />
				))}
			</div>
		);
	}

	if (nsError) {
		return (
			<Banner variant="danger">Failed to load DNS config: {(nsError as Error).message}</Banner>
		);
	}

	const splitEntries = Object.entries(splitDns ?? {});

	return (
		<div className={styles.container}>
			<div className={styles.magicDns}>
				<span className={styles.magicLabel}>MagicDNS</span>
				<Badge variant={prefs?.magicDNS ? "success" : "default"}>
					{prefs?.magicDNS ? "Enabled" : "Disabled"}
				</Badge>
			</div>

			<DnsEntry label="Nameservers" values={nameservers ?? []} />
			<DnsEntry label="Search Paths" values={searchPaths ?? []} />

			{splitEntries.length > 0 && (
				<div className={styles.splitSection}>
					<h3 className={styles.sectionTitle}>Split DNS</h3>
					<div className={styles.splitGrid}>
						{splitEntries.map(([domain, servers]) => (
							<DnsEntry key={domain} label={domain} values={servers} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
