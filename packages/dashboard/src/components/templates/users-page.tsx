import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUsers } from "@/hooks/use-users";
import type { User as UserType } from "@tailscale/tailscale-typescript-sdk";
import { Clock, Laptop, Shield, User, UserCheck, UserX } from "lucide-react";

function formatDate(dateStr: string | undefined) {
	if (!dateStr) return "Never";
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMins = Math.floor(diffMs / (1000 * 60));

	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 30) return `${diffDays}d ago`;
	return date.toLocaleDateString();
}

function UserCard({ user }: { user: UserType }) {
	const isConnected = user.currentlyConnected;
	const isAdmin = user.tailnetRole === "admin";
	const isTagged = user.type === "tagged";

	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4">
						<div
							className={`rounded-full p-2 ${
								isTagged ? "bg-purple-100" : isAdmin ? "bg-blue-100" : "bg-gray-100"
							}`}
						>
							<User
								className={`h-5 w-5 ${
									isTagged ? "text-purple-600" : isAdmin ? "text-blue-600" : "text-gray-600"
								}`}
							/>
						</div>
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="font-medium">{user.displayName || user.loginName}</h3>
								{isConnected ? (
									<Badge variant="outline" className="text-xs">
										<UserCheck className="mr-1 h-3 w-3" />
										Online
									</Badge>
								) : (
									<Badge variant="outline" className="text-xs text-muted-foreground">
										<UserX className="mr-1 h-3 w-3" />
										Offline
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground">{user.loginName}</p>
							<div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
								{isAdmin && (
									<span className="flex items-center gap-1">
										<Shield className="h-3 w-3" />
										Admin
									</span>
								)}
								{user.deviceCount !== undefined && (
									<span className="flex items-center gap-1">
										<Laptop className="h-3 w-3" />
										{user.deviceCount} {user.deviceCount === 1 ? "device" : "devices"}
									</span>
								)}
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									Last seen: {formatDate(user.lastSeen)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function UsersPage() {
	const { data, error, isLoading } = useUsers();
	const users = data?.users || [];

	// Separate users by type
	const members = users.filter((u) => u.type !== "tagged");
	const taggedDevices = users.filter((u) => u.type === "tagged");
	const onlineCount = users.filter((u) => u.currentlyConnected).length;
	const adminCount = users.filter((u) => u.tailnetRole === "admin").length;
	const totalDevices = users.reduce((sum, u) => sum + (u.deviceCount || 0), 0);

	if (isLoading) {
		return (
			<div className="container max-w-6xl py-8">
				<div className="text-center text-muted-foreground">Loading users...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container max-w-6xl py-8">
				<div className="text-center text-red-500">
					Error loading users: {(error as Error).message}
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-6xl py-8 space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Users</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Manage team members and their access to your network
				</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Users</p>
								<p className="text-2xl font-semibold">{members.length}</p>
							</div>
							<User className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Online Now</p>
								<p className="text-2xl font-semibold">{onlineCount}</p>
							</div>
							<UserCheck className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Admins</p>
								<p className="text-2xl font-semibold">{adminCount}</p>
							</div>
							<Shield className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Devices</p>
								<p className="text-2xl font-semibold">{totalDevices}</p>
							</div>
							<Laptop className="h-8 w-8 text-indigo-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Team Members */}
			{members.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-medium">Team Members</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{members.map((user) => (
							<UserCard key={user.id} user={user} />
						))}
					</div>
				</div>
			)}

			{/* Tagged Devices */}
			{taggedDevices.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-medium">Service Accounts</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{taggedDevices.map((user) => (
							<UserCard key={user.id} user={user} />
						))}
					</div>
				</div>
			)}

			{users.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="font-medium mb-2">No users found</h3>
						<p className="text-sm text-muted-foreground">
							Users will appear here once they join your network
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
