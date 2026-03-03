export interface AuthProvider {
	getAuthHeaders(): Promise<Record<string, string>>;
}
