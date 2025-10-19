import React from 'react';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getEventById } from '@/lib/actions/event.action';
import { getUserByClerkId } from '@/lib/actions/user.action';
import { getUserHighestRole } from '@/lib/actions/userrole.action';
import { hasEventPermission } from '@/lib/utils/auth';
import IssueManagement from '@/components/shared/IssueManagement';

interface EventIssuesPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventIssuesPage({ params }: EventIssuesPageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect('/sign-in');
  }

  const [event, user] = await Promise.all([
    getEventById(id),
    getUserByClerkId(clerkId)
  ]);

  if (!event) {
    redirect('/');
  }

  // Check if user has permission to view issues (organizer, volunteer, or speaker)
  const isOrganizer = String(event.organizer._id) === String(user._id);
  const userRole = await getUserHighestRole(user._id.toString(), id);
  const canViewAttendees = await hasEventPermission(
    user._id.toString(),
    id,
    'canViewAttendees'
  );

  if (!isOrganizer && !canViewAttendees) {
    redirect(`/event/${id}`);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm" className="bg-white text-red-600 hover:bg-gray-100">
              <Link href={`/event/${id}/manage`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-white text-red-600 hover:bg-gray-100">
              <Link href={`/event/${id}`}>
                View Event Page
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white">Issue Management</h1>
          <p className="text-red-100 mt-2">
            Review and manage issues reported by attendees for {event.title}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <IssueManagement
          eventId={id}
          eventTitle={event.title}
          organizerId={user._id.toString()}
        />
      </div>
    </div>
  );
}
