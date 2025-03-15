import React from "react";

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex justify-center p-6">
			<main className="w-full max-w-2xl py-32">
				{children}
			</main>
		</div>
	);
}
