import { useCallback, useState } from "react";
import { usePolicy, useValidatePolicy } from "../../hooks/use-policy.ts";
import { Banner } from "../atoms/banner.tsx";
import { CodeBlock } from "../atoms/code-block.tsx";
import { Skeleton } from "../atoms/skeleton.tsx";
import styles from "./acl-display.module.css";

export function AclDisplay() {
	const { data: policy, isLoading, error } = usePolicy();
	const validate = useValidatePolicy();
	const [validationResult, setValidationResult] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const handleValidate = useCallback(() => {
		if (!policy) return;
		setValidationResult(null);
		validate.mutate(policy, {
			onSuccess: () => {
				setValidationResult({ type: "success", message: "Policy is valid" });
			},
			onError: (err) => {
				setValidationResult({
					type: "error",
					message: (err as Error).message,
				});
			},
		});
	}, [policy, validate]);

	if (isLoading) {
		return <Skeleton height="400px" borderRadius="var(--radius)" />;
	}

	if (error) {
		return <Banner variant="danger">Failed to load policy: {(error as Error).message}</Banner>;
	}

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				<button
					type="button"
					className={styles.validateBtn}
					onClick={handleValidate}
					disabled={validate.isPending}
				>
					{validate.isPending ? "Validating..." : "Validate Policy"}
				</button>
			</div>

			{validationResult && (
				<Banner variant={validationResult.type === "success" ? "success" : "danger"}>
					{validationResult.message}
				</Banner>
			)}

			<CodeBlock code={policy ?? ""} language="HuJSON" />
		</div>
	);
}
