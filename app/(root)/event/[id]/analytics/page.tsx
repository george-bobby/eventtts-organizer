import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getEventById } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import EventAnalyticsDashboard from "@/components/shared/EventAnalyticsDashboard";

interface EventAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventAnalyticsPage({
  params,
}: EventAnalyticsPageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const [event, user] = await Promise.all([
    getEventById(id),
    getUserByClerkId(clerkId),
  ]);

  if (!event) {
    redirect("/");
  }

  // Check if user is the organizer
  if (String(event.organizer._id) !== String(user._id)) {
    redirect(`/event/${id}`);
  }

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Analytics
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
          Event<br />
          <span className="text-muted-foreground">Analytics.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Comprehensive performance metrics and insights for {event.title}
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
        <EventAnalyticsDashboard
          eventId={id}
          event={event}
          organizerId={user._id}
        />
      </div>
    </div>
  );
}
