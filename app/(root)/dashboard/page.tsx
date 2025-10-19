import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import EventCreatorDashboard from "@/components/shared/EventCreatorDashboard";
import RoleBasedEventSections from "@/components/shared/RoleBasedEventSections";
import { getUserEventData } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";

// ✅ This is the definitive fix for the headers/searchParams error
export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  searchParams: Promise<{ page?: string }>;
}

const ProfilePage = async ({ searchParams }: ProfilePageProps) => {
  // ✅ Await auth() to avoid header issues in Next.js 15
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  try {
    const mongoUserDoc = await getUserByClerkId(clerkId);
    // Convert Mongoose document to plain object for Client Component
    const mongoUser = JSON.parse(JSON.stringify(mongoUserDoc));

    // Await searchParams in Next.js 15+
    const params = await searchParams;
    const organizedEventsPage = Number(params.page) || 1;

    // Get comprehensive user event data including role-based events
    const userEventData = await getUserEventData(mongoUserDoc._id, organizedEventsPage);

    const myOrganizedEvents = userEventData.organizedEvents || [];
    const eventsByRole = userEventData.eventsByRole || {
      organizer: [],
      volunteer: [],
      speaker: [],
      participant: []
    };



    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          {/* Event Creator Dashboard - Only show if user has organized events */}
          {myOrganizedEvents.length > 0 && (
            <section className="mb-12">
              <EventCreatorDashboard events={myOrganizedEvents} />
            </section>
          )}

          {/* Role-Based Event Sections */}
          <RoleBasedEventSections
            eventsByRole={eventsByRole}
            currentUserId={clerkId}
            mongoUser={mongoUser}
          />

        </div>
      </div>
    );
  } catch (error) {
    console.error('Profile page error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">We encountered an error while loading your profile.</p>
          <Link href="/" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }
};

export default ProfilePage;