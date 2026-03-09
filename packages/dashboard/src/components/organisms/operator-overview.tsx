import { useAuthorizeDevice, useDevices } from "@/hooks/use-devices";
import { useCreateKey } from "@/hooks/use-keys";
import { useApplyPolicyRecipe, usePolicy } from "@/hooks/use-policy";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { Banner } from "../atoms/banner";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { OverviewCharts } from "./overview-charts";

export function OperatorOverview() {
	const navigate = useNavigate();
	const { data: devices } = useDevices();
	const { data: policyHujson } = usePolicy();
	const createKey = useCreateKey();
	const authorizeDevice = useAuthorizeDevice();
	const applyRecipe = useApplyPolicyRecipe();
	const { toast } = useToast();
	const lastAppliedRecipeRef = useRef<string | null>(null);
	const lastKeySuccessRef = useRef(false);
	const lastAuthorizeSuccessRef = useRef(false);

	const pendingDevice = useMemo(() => devices?.find((device) => !device.authorized), [devices]);

	const openNetwork = useMemo(() => {
		if (!policyHujson) return false;
		return /accept/i.test(policyHujson) && /\*:\*/.test(policyHujson) && /src/i.test(policyHujson);
	}, [policyHujson]);

	const actionErrors = [
		applyRecipe.error ? `Lock Down Network failed: ${(applyRecipe.error as Error).message}` : null,
		createKey.error ? `Create 24h Key failed: ${(createKey.error as Error).message}` : null,
		authorizeDevice.error
			? `Approve Pending Device failed: ${(authorizeDevice.error as Error).message}`
			: null,
	].filter(Boolean) as string[];

	useEffect(() => {
		const appliedRecipe = applyRecipe.data?.applied ?? null;
		if (appliedRecipe && appliedRecipe !== lastAppliedRecipeRef.current) {
			toast({
				title: "Policy updated",
				description: `ACL recipe applied: ${appliedRecipe}`,
			});
		}
		lastAppliedRecipeRef.current = appliedRecipe;
	}, [applyRecipe.data?.applied, toast]);

	useEffect(() => {
		if (createKey.isSuccess && !lastKeySuccessRef.current) {
			toast({
				title: "Auth key created",
				description: "24h key generated successfully.",
			});
		}
		lastKeySuccessRef.current = createKey.isSuccess;
	}, [createKey.isSuccess, toast]);

	useEffect(() => {
		if (authorizeDevice.isSuccess && !lastAuthorizeSuccessRef.current) {
			toast({
				title: "Device approved",
				description: "Pending device authorization updated.",
			});
		}
		lastAuthorizeSuccessRef.current = authorizeDevice.isSuccess;
	}, [authorizeDevice.isSuccess, toast]);

	return (
		<div className="space-y-6">
			{actionErrors.map((message) => (
				<Banner key={message} variant="danger">
					{message}
				</Banner>
			))}

			<Card
				className={
					openNetwork
						? "border-yellow-500/30 bg-yellow-500/10"
						: "border-green-500/30 bg-green-500/10"
				}
			>
				<CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1 text-sm">
						<div className="flex items-center gap-2 font-medium">
							{openNetwork ? (
								<>
									<ShieldAlert className="h-4 w-4 text-yellow-500" />
									Open network rule detected
								</>
							) : (
								<>
									<ShieldCheck className="h-4 w-4 text-green-500" />
									No immediate ACL risk
								</>
							)}
						</div>
						<p className="leading-6 text-muted-foreground">
							{openNetwork
								? "Default allow-all path is active. Lock down now to reduce blast radius."
								: "Policy posture is currently restricted."}
						</p>
					</div>
					<Button
						variant="outline"
						className="w-full sm:w-auto sm:justify-between"
						onClick={() => navigate("/acl")}
					>
						Review Access Control
						<ArrowRight className="h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-4">
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>
						Do the 3 most common operations without leaving Overview.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-3">
					<Button
						variant="destructive"
						onClick={() => applyRecipe.mutate("lockdown")}
						disabled={applyRecipe.isPending}
						className="h-auto items-start justify-between gap-3 px-4 py-4 text-left"
					>
						<span className="space-y-1">
							<span className="block font-semibold">Lock Down Network</span>
							<span className="block text-xs opacity-90">Remove default allow-all immediately</span>
						</span>
						<ShieldAlert className="h-4 w-4 shrink-0" />
					</Button>

					<Button
						variant="secondary"
						onClick={() =>
							createKey.mutate({
								description: "24h demo key",
								expirySeconds: 24 * 60 * 60,
								capabilities: {
									devices: {
										create: {
											reusable: false,
											ephemeral: false,
											preauthorized: false,
											tags: [],
										},
									},
								},
							})
						}
						disabled={createKey.isPending}
						className="h-auto items-start justify-between gap-3 px-4 py-4 text-left"
					>
						<span className="space-y-1">
							<span className="block font-semibold">Create 24h Key</span>
							<span className="block text-xs opacity-90">
								Generate a short-lived auth key preset
							</span>
						</span>
						<KeyRound className="h-4 w-4 shrink-0" />
					</Button>

					<Button
						variant="outline"
						onClick={() =>
							pendingDevice && authorizeDevice.mutate({ id: pendingDevice.id, authorized: true })
						}
						disabled={!pendingDevice || authorizeDevice.isPending}
						className="h-auto items-start justify-between gap-3 px-4 py-4 text-left"
					>
						<span className="space-y-1">
							<span className="block font-semibold">Approve Pending Device</span>
							<span className="block text-xs text-muted-foreground">
								{pendingDevice
									? pendingDevice.hostname || pendingDevice.name
									: "No pending devices"}
							</span>
						</span>
						<CheckCircle2 className="h-4 w-4 shrink-0" />
					</Button>
				</CardContent>
			</Card>

			<OverviewCharts />
		</div>
	);
}
