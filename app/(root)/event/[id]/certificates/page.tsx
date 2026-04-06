import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { getEventStakeholders } from "@/lib/actions/stakeholder.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import SimpleCertificateManagement from "@/components/shared/SimpleCertificateManagement";
import { headers } from "next/headers";

interface CertificatesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificatesPage({
  params,
}: CertificatesPageProps) {
  await headers();
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Get user for default template creation
    const user = await getUserByClerkId(userId);

    // Fetch stakeholders
    const stakeholders = await getEventStakeholders(id);

    return (
      <div className="bg-background min-h-screen pt-16">
        {/* Header Section */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-border" />
            Certificates
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
            Manage<br />
            <span className="text-muted-foreground">Certificates.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create templates, generate certificates, and manage distribution
            for your event
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
          <SimpleCertificateManagement
            eventId={id}
            stakeholders={stakeholders}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading certificates page:", error);
    return (
      <div className="bg-background min-h-screen pt-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-border" />
            Error
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-4">
            Certificate<br />
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
              Error Loading Certificates
            </h1>
            <p className="text-muted-foreground">
              There was an error loading the certificate management page. Please
              try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
