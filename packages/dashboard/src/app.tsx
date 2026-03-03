import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Header } from "./components/organisms/header.tsx";
import { Sidebar } from "./components/organisms/sidebar.tsx";
import { AclPage } from "./components/templates/acl-page.tsx";
import { DeviceDetailPage } from "./components/templates/device-detail-page.tsx";
import { DevicesPage } from "./components/templates/devices-page.tsx";
import { DnsPage } from "./components/templates/dns-page.tsx";
import { KeysPage } from "./components/templates/keys-page.tsx";
import { OverviewPage } from "./components/templates/overview-page.tsx";
import { UsersPage } from "./components/templates/users-page.tsx";

export function App() {
	return (
		<BrowserRouter>
			<div className="layout">
				<Sidebar />
				<div className="layout__content">
					<Header />
					<main className="layout__main">
						<Routes>
							<Route path="/" element={<OverviewPage />} />
							<Route path="/devices" element={<DevicesPage />} />
							<Route path="/devices/:id" element={<DeviceDetailPage />} />
							<Route path="/users" element={<UsersPage />} />
							<Route path="/keys" element={<KeysPage />} />
							<Route path="/dns" element={<DnsPage />} />
							<Route path="/acl" element={<AclPage />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</main>
				</div>
			</div>
		</BrowserRouter>
	);
}
