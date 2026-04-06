import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEventById } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { getUserHighestRole } from "@/lib/actions/userrole.action";
import { hasEventPermission } from "@/lib/utils/auth";
import AttendeeManagement from "@/components/shared/AttendeeManagement";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AttendeePageProps {
  params: Promise<{ id: string }>;
}

export default async function AttendeePage({ params }: AttendeePageProps) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const { id: eventId } = await params;

  // Get the event and verify ownership
  const event = await getEventById(eventId);
  if (!event) {
    redirect("/");
  }

  // Get the current user
  const mongoUser = await getUserByClerkId(clerkId);
  if (!mongoUser) {
    redirect("/sign-in");
  }

  // Check if user has permission to view attendees (organizer, volunteer, or speaker)
  const isOrganizer = String(event.organizer._id) === String(mongoUser._id);
  const userRole = await getUserHighestRole(mongoUser._id.toString(), eventId);
  const canViewAttendees = await hasEventPermission(
    mongoUser._id.toString(),
    eventId,
    "canViewAttendees",
  );

  if (!isOrganizer && !canViewAttendees) {
    redirect(`/event/${eventId}`);
  }

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Attendees
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
          Manage<br />
          <span className="text-muted-foreground">Attendees.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Manage registrations and export attendee data for your event
        </p>
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground hover:bg-muted"
          >
            <Link href={`/event/${eventId}/manage`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground hover:bg-muted"
          >
            <Link href={`/event/${eventId}`}>View Event Page</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-20">
        <AttendeeManagement
          eventId={eventId}
          organizerId={String(mongoUser._id)}
          eventTitle={event.title}
        />
      </div>
    </div>
  );
}
