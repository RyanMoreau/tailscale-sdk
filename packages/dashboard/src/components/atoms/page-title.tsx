interface PageTitleProps {
	title: string;
	description: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
	return (
		<div className="space-y-2">
			<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
			<p className="max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
		</div>
	);
}
