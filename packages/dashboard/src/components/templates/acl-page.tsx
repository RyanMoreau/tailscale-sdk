import { PageTitle } from "../atoms/page-title.tsx";
import { SimpleAclEditor } from "../organisms/simple-acl-editor.tsx";

export function AclPage() {
	return (
		<div className="space-y-6">
			<PageTitle
				title="Access Control"
				description="Define and adjust ACL policy quickly so incident-time changes take only a few clicks."
			/>
			<SimpleAclEditor showHeader={false} />
		</div>
	);
}
