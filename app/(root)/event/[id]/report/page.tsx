// app/(root)/event/[id]/report/page.tsx

import ReportForm from "@/components/shared/ReportForm";
import { getEventById } from "@/lib/actions/event.action";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const ReportPage = async ({ params }: ReportPageProps) => {
  const { id } = await params;
  const { userId } = await auth();

  const event = await getEventById(id);

  if (!event) {
    return (
      <div className="wrapper text-center">
        <h1>Event not found</h1>
        <p>The event you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Reports
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
          Generate<br />
          <span className="text-muted-foreground">Report.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Generate comprehensive, AI-powered reports for {event.title}
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
        <ReportForm
          eventId={id}
          userId={userId}
          event={JSON.parse(JSON.stringify(event))}
        />
      </div>
    </div>
  );
};

export default ReportPage;
