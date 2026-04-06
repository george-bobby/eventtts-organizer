import { auth } from "@clerk/nextjs/server";
import { getEventById } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import IssueReportForm from "@/components/shared/IssueReportForm";
import { redirect } from "next/navigation";
import { Metadata } from "next";

interface IssueReportPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: IssueReportPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEventById(resolvedParams.id);

  return {
    title: `Report Issue - ${event?.title || "Event"} | SAP Hackathon`,
    description: `Report a problem or issue with ${event?.title || "this event"}. Get help with tickets, technical issues, or event information.`,
    robots: "noindex, nofollow", // Don't index issue report pages
  };
}

export default async function IssueReportPage({
  params,
}: IssueReportPageProps) {
  const { userId } = await auth();
  const resolvedParams = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch event and user data
  const [event, user] = await Promise.all([
    getEventById(resolvedParams.id),
    getUserByClerkId(userId),
  ]);

  if (!event) {
    redirect("/explore");
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Report an Issue
            </h1>
            <p className="text-muted-foreground">
              Help us improve your event experience by reporting any issues you
              encounter
            </p>
          </div>

          {/* Form */}
          <IssueReportForm event={event} currentUserId={userId} />

          {/* Help Section */}
          <div className="mt-8 bg-muted/40 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              What happens next?
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>
                  Your issue report will be sent immediately to the event
                  organizer via email
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>
                  The organizer will review your report and may contact you
                  directly for more information
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>
                  You can track the status of your report in your dashboard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
