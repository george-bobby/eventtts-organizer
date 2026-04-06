import EventCard from "@/components/shared/EventCard";
import NoResults from "@/components/shared/NoResults";
import { getLikedEvents, getUserByClerkId } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const rawUser = await getUserByClerkId(userId);
	const user = JSON.parse(JSON.stringify(rawUser));

	const likedEvents = await getLikedEvents(user._id);

	return (
		<div className="min-h-screen bg-background px-6 py-12 pt-32">
			<h1 className="text-4xl max-sm:text-2xl font-bold text-center text-foreground mb-5">
				Liked Events
			</h1>
			<div className="flex justify-evenly items-center gap-10 flex-wrap">
				{likedEvents.length > 0 ? (
					likedEvents.map((event: any) => {
						return (
							<EventCard
								key={event._id}
								event={event}
								currentUserId={userId}
								user={user}
								likedEvent={true} // All events in likes page are liked by definition
							/>
						);
					})
				) : (
					<NoResults
						title="No Liked Events"
						desc="You haven't liked any events yet."
					/>
				)}
			</div>
		</div>
	);
};

export default Page;
