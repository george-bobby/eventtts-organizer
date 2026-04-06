// app/event/[id]/update/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";

interface UpdateEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

const UpdateEventPage = async ({ params }: UpdateEventPageProps) => {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the current user
  const user = await getUserByClerkId(userId);

  // Get the event data
  const event = await getEventById(id);

  // Check if the current user is the organizer of this event
  if (!event || String(event.organizer._id) !== String(user._id)) {
    redirect("/");
  }

  // Serialize the event to match IEvent interface expected by EventForm
  const serializedEvent = JSON.parse(JSON.stringify(event));

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Edit
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
          Update<br />
          <span className="text-muted-foreground">Event.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Make changes to your event and keep your community informed
        </p>
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground hover:bg-muted"
          >
            <Link href={`/event/${id}/manage`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-foreground/20 text-foreground hover:bg-muted"
          >
            <Link href={`/event/${id}`}>View Event Page</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-20">
        <div className="bg-card border border-border p-8 lg:p-12">
          <EventForm
            userId={user._id.toString()}
            type="edit"
            event={serializedEvent}
            eventId={event._id.toString()}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateEventPage;
