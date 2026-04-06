import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  getEventStakeholders,
  getStakeholderStats,
} from "@/lib/actions/stakeholder.action";
import StakeholderManagement from "@/components/shared/StakeholderManagement";

interface StakeholdersPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    role?: string;
    search?: string;
  }>;
}

export default async function StakeholdersPage({
  params,
  searchParams,
}: StakeholdersPageProps) {
  const { id } = await params;
  const searchFilters = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Fetch stakeholders and stats in parallel
    const [stakeholders, stats] = await Promise.all([
      getEventStakeholders(id, {
        role: searchFilters.role,
        search: searchFilters.search,
      }),
      getStakeholderStats(id),
    ]);

    return (
      <div className="bg-background min-h-screen pt-16">
        {/* Header Section */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-border" />
            Stakeholders
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
            Manage<br />
            <span className="text-muted-foreground">Stakeholders.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Invite volunteers and speakers to your event via email
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
          <StakeholderManagement
            eventId={id}
            stakeholders={stakeholders}
            stats={stats}
            filters={{
              role: searchFilters.role,
              search: searchFilters.search,
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading stakeholders page:", error);
    return (
      <div className="bg-background min-h-screen pt-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-border" />
            Error
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
            Stakeholder<br />
            <span className="text-muted-foreground">Error.</span>
          </h1>
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
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Stakeholders
            </h1>
            <p className="text-muted-foreground">
              There was an error loading the stakeholder management page. Please
              try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
