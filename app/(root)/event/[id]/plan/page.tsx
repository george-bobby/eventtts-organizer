import EventPlanner from "@/components/shared/EventPlanner";
import { getEventById } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NoResults from "@/components/shared/NoResults";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subEventId?: string }>;
}

const EventPlanPage = async ({ params, searchParams }: Props) => {
  // ✅ FIX: Await headers() and params at the top for Next.js 15 compatibility
  await headers();
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;

  // ✅ Await auth() to avoid header issues in Next.js 15
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);
  const event = await getEventById(awaitedParams.id);

  if (!event) {
    return (
      <NoResults
        title="Event not found"
        desc="The event you are looking for does not exist."
        link="/"
        linkTitle="Go Home"
      />
    );
  }

  // Check if user is the organizer
  if (String(event.organizer._id) !== String(user._id)) {
    return (
      <NoResults
        title="Access Denied"
        desc="Only the event organizer can access the planning board."
        link={`/event/${event._id}`}
        linkTitle="Back to Event"
      />
    );
  }

  // If subEventId is provided, find the sub-event
  let targetEvent = {
    _id: event._id.toString(),
    title: event.title,
    category: (event.category as any)?.name || event.category || "Unknown",
    description: event.description,
    startDate: event.startDate.toString(),
    endDate: event.endDate.toString(),
    location: event.location,
    isOnline: event.isOnline || false,
    totalCapacity: event.totalCapacity || 0,
    isFree: event.isFree || false,
    price: event.price || 0,
  };
  let isSubEvent = false;

  if (awaitedSearchParams.subEventId) {
    const subEvent = event.subEvents?.find(
      (se: any) => se._id.toString() === awaitedSearchParams.subEventId,
    );
    if (subEvent) {
      targetEvent = {
        _id: (subEvent._id as any).toString(),
        title: subEvent.title,
        category:
          (subEvent.category as any)?.name || subEvent.category || "Unknown",
        description: subEvent.description,
        startDate: subEvent.startDate.toString(),
        endDate: subEvent.endDate.toString(),
        location: subEvent.location,
        isOnline: subEvent.isOnline || false,
        totalCapacity: subEvent.totalCapacity || 0,
        isFree: subEvent.isFree || false,
        price: subEvent.price || 0,
      };
      isSubEvent = true;
    }
  }

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Planning
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
          Plan<br />
          <span className="text-muted-foreground">Event.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered task planning and management for {targetEvent.title}
        </p>
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground hover:bg-muted"
          >
            <Link href={`/event/${awaitedParams.id}/manage`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground hover:bg-muted"
          >
            <Link href={`/event/${awaitedParams.id}`}>View Event Page</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-6">
        <EventPlanner event={targetEvent} isSubEvent={isSubEvent} />
      </div>
    </div>
  );
};

export default EventPlanPage;
