import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getEventById } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import FeedbackManagement from "@/components/shared/FeedbackManagement";
import { headers } from "next/headers";

interface FeedbackManagementPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackManagementPage({
  params,
}: FeedbackManagementPageProps) {
  await headers();
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
    redirect("/explore");
  }

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is the organizer
  const isOrganizer = event.organizer._id.toString() === user._id.toString();

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Feedback
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
          Feedback<br />
          <span className="text-muted-foreground">Management.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Manage feedback collection and view responses for {event.title}
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
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-20">
        <FeedbackManagement
          eventId={id}
          eventTitle={event.title}
          isOrganizer={isOrganizer}
          isOnline={event.isOnline}
        />
      </section>
    </div >
  );
}
