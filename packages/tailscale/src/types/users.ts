export interface User {
	id: string;
	loginName: string;
	displayName?: string;
	profilePicURL?: string;
	tailnetRole?: string;
	created?: string;
	lastSeen?: string;
	currentlyConnected?: boolean;
	deviceCount?: number;
	type?: "member" | "shared" | "tagged";
	status?: string;
}

export interface UsersListResponse {
	users?: User[];
}

export interface UserGetResponse extends User {
	// Additional fields that might be in single user response
	devices?: string[];
}
