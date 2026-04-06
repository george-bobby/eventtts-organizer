import EventForm from "@/components/shared/EventForm";
import { getUserByClerkId, getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import React from "react";

const Page = async () => {
	// ✅ Await auth() to avoid header issues in Next.js 15
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const user = await getUserByClerkId(userId);

	return (
		<div className="bg-background min-h-screen pb-24 lg:pb-32">
			<div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-24">
				{/* Header Section */}
				<div className="mb-16 lg:mb-24">
					<div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
						<span className="w-8 h-px bg-border" />
						Create Something Amazing
					</div>
					<h1 className="text-[clamp(3rem,6vw,6rem)] font-display tracking-tight leading-[0.9] text-foreground">
						Create a<br />
						<span className="text-muted-foreground">New Event.</span>
					</h1>
				</div>

				{/* Form Section */}
				<div className="bg-card border border-border p-8 lg:p-12">
					<EventForm userId={user._id.toString()} type="create" />
				</div>
			</div>
		</div>
	);
};

export default Page;
