import EventCard from "@/components/shared/EventCard";
import EventCards from "@/components/shared/EventCards";
import LikeCartButton from "@/components/shared/LikeCartButton";
import NoResults from "@/components/shared/NoResults";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventById, getRelatedEvents } from "@/lib/actions/event.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { checkUserRegistration } from "@/lib/actions/order.action";
import { dateConverter, timeFormatConverter } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { headers } from "next/headers";
import {
  MessageSquare,
  AlertTriangle,
  Settings,
  CheckSquare,
  Users,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react";
import { getUserHighestRole } from "@/lib/actions/userrole.action";
import RoleBadge from "@/components/shared/RoleBadge";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  await headers();
  const awaitedParams = await params;
  const { userId } = await auth();

  let user = null;
  let likedEvent = false;
  let isRegistered = false;
  let userRole = null;

  if (userId) {
    const rawUser = await getUserByClerkId(userId);
    if (rawUser) {
      user = JSON.parse(JSON.stringify(rawUser));
      likedEvent = user.likedEvents.includes(awaitedParams.id);
      isRegistered = await checkUserRegistration({
        userId: user._id,
        eventId: awaitedParams.id,
      });
      userRole = await getUserHighestRole(user._id.toString(), awaitedParams.id);
    }
  }

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

  const relatedEvents = !event.parentEvent
    ? await getRelatedEvents(awaitedParams.id)
    : [];

  const isOrganizer = user && String(event.organizer._id) === String(user._id);

  const organizerName = `${(event.organizer as any)?.firstName || ""} ${(event.organizer as any)?.lastName || ""}`.trim();
  const categoryName = (event.category as any)?.name || "Uncategorized";
  const isMultiDay = new Date(event.endDate) > new Date(event.startDate);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Image */}
      {event.photo && (
        <div className="relative w-full h-[45vh] md:h-[60vh] overflow-hidden">
          <Image
            src={event.photo}
            alt={event.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Title block — pulled up over the image */}
        <div className={event.photo ? "-mt-28 relative z-10" : "pt-32"}>
          {/* Breadcrumb label */}
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-12 h-px bg-foreground/30" />
            {event.parentEvent ? "Sub-Event" : categoryName}
          </span>

          <h1 className="text-5xl md:text-7xl lg:text-[88px] font-display tracking-tight leading-[0.92] text-foreground mb-8 max-w-5xl">
            {event.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Badge className="text-sm px-4 py-1.5 rounded-full">
              {event.isFree ? "Free" : `₹ ${event.price}`}
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full">
              {categoryName}
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
              By {organizerName}
            </Badge>
            {userRole && <RoleBadge role={userRole} size="md" />}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 pb-24 lg:pb-32">
          {/* Left — main info (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">
                <span className="w-8 h-px bg-foreground/20" />
                About
              </span>
              <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-line">
                {event.description}
              </p>
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-mono text-foreground border-b border-foreground/30 hover:border-foreground pb-px transition-colors"
                >
                  {event.url}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">
                  <span className="w-8 h-px bg-foreground/20" />
                  Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: any) => (
                    <Badge key={tag.name} variant="outline" className="text-sm px-3 py-1 rounded-full">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Registered notice */}
            {isRegistered && !isOrganizer && (
              <div className="border border-border bg-muted/30 p-8">
                <h3 className="font-display text-2xl text-foreground mb-3">
                  You&apos;re Registered
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You have successfully registered for this event. If you encounter
                  any issues, use the &quot;Report Issue&quot; button in the sidebar.
                </p>
              </div>
            )}
          </div>

          {/* Right — sticky details card (1/3) */}
          <div className="space-y-6">
            {/* Details bento box */}
            <div className="bg-muted/40 border border-border p-8 space-y-6">
              <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <span className="w-8 h-px bg-foreground/20" />
                Details
              </span>

              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Date</div>
                  <div className="text-sm text-foreground font-medium">
                    {isMultiDay
                      ? `${dateConverter(event.startDate.toString())} – ${dateConverter(event.endDate.toString())}`
                      : dateConverter(event.startDate.toString())}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Time</div>
                  <div className="text-sm text-foreground font-medium">
                    {timeFormatConverter(event.startTime)} – {timeFormatConverter(event.endTime)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                  {event.isOnline ? (
                    <Globe className="w-4 h-4 text-foreground" />
                  ) : (
                    <MapPin className="w-4 h-4 text-foreground" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    {event.isOnline ? "Format" : "Location"}
                  </div>
                  <div className="text-sm text-foreground font-medium">
                    {event.isOnline ? "Online Event" : event.location}
                    {event.landmark && !event.isOnline && (
                      <span className="block text-muted-foreground font-normal">{event.landmark}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons bento */}
            <div className="bg-muted/40 border border-border p-8 space-y-4">
              <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                <span className="w-8 h-px bg-foreground/20" />
                Actions
              </span>

              {!userId ? (
                <div className="flex flex-col gap-3">
                  <Button asChild size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                    <Link href="/sign-in">Sign In to Register</Link>
                  </Button>
                  <LikeCartButton event={event} user={user} likedEvent={likedEvent} option="eventPage" />
                </div>
              ) : isOrganizer || userRole ? (
                <div className="flex flex-col gap-3">
                  {(isOrganizer || userRole === "organizer") && (
                    <Button asChild size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                      <Link href={`/event/${event._id}/manage`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Event
                      </Link>
                    </Button>
                  )}
                  {(userRole === "volunteer" || userRole === "speaker") && (
                    <Button asChild size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                      <Link href={`/event/${event._id}/manage`}>
                        <Settings className="w-4 h-4 mr-2" />
                        {userRole === "volunteer" ? "Volunteer Tools" : "Speaker Tools"}
                      </Link>
                    </Button>
                  )}
                  {userRole === "participant" && (
                    <Button asChild size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                      <Link href={`/event/${event._id}/ticket`}>
                        <Ticket className="w-4 h-4 mr-2" />
                        View Ticket
                      </Link>
                    </Button>
                  )}
                  {(userRole === "volunteer" || userRole === "organizer" || isOrganizer) && (
                    <Button asChild size="lg" variant="outline" className="w-full rounded-full border-border">
                      <Link href={`/event/${event._id}/verify`}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Verify Tickets
                      </Link>
                    </Button>
                  )}
                  {(userRole === "volunteer" || userRole === "speaker" || userRole === "organizer" || isOrganizer) && (
                    <Button asChild size="lg" variant="outline" className="w-full rounded-full border-border">
                      <Link href={`/event/${event._id}/attendees`}>
                        <Users className="w-4 h-4 mr-2" />
                        View Attendees
                      </Link>
                    </Button>
                  )}
                  {userRole === "participant" && (() => {
                    const now = new Date();
                    const endDate = new Date(event.endDate);
                    const [hours, minutes] = event.endTime.split(":").map(Number);
                    endDate.setHours(hours, minutes, 0, 0);
                    return now > endDate ? (
                      <Button asChild size="lg" variant="outline" className="w-full rounded-full border-border">
                        <Link href={`/event/${event._id}/submit/feedback`}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg" variant="outline" className="w-full rounded-full border-border">
                        <Link href={`/event/${event._id}/submit/issue`}>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Report Issue
                        </Link>
                      </Button>
                    );
                  })()}
                </div>
              ) : isRegistered ? (
                <div className="flex flex-col gap-3">
                  <Button asChild size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                    <Link href={`/event/${event._id}/ticket`}>
                      <Ticket className="w-4 h-4 mr-2" />
                      View My Ticket
                    </Link>
                  </Button>
                  {(() => {
                    const now = new Date();
                    const endDate = new Date(event.endDate);
                    const [hours, minutes] = event.endTime.split(":").map(Number);
                    endDate.setHours(hours, minutes, 0, 0);
                    return now > endDate ? (
                      <Button asChild size="lg" variant="outline" className="w-full rounded-full border-border">
                        <Link href={`/event/${event._id}/submit/feedback`}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg" variant="outline" className="w-full rounded-full border-border">
                        <Link href={`/event/${event._id}/submit/issue`}>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Report Issue
                        </Link>
                      </Button>
                    );
                  })()}
                </div>
              ) : (
                <LikeCartButton
                  event={JSON.parse(JSON.stringify(event))}
                  user={JSON.parse(JSON.stringify(user))}
                  likedEvent={likedEvent}
                  option="eventPage"
                />
              )}
            </div>
          </div>
        </div>

        {/* Sub-Events */}
        {event.subEvents && event.subEvents.length > 0 && (
          <div className="pb-24 lg:pb-32 border-t border-border pt-16 lg:pt-24">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-12 h-px bg-foreground/30" />
              Sub-Events
            </span>
            <h2 className="text-5xl md:text-6xl font-display tracking-tight leading-[0.92] mb-12 lg:mb-16">
              Part of this<br />
              <span className="text-muted-foreground">series.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-8">
              {event.subEvents.map((subEvent: any) => {
                const subEventLikedEvent = user?.likedEvents
                  ? user.likedEvents.includes(subEvent._id)
                  : false;
                return (
                  <EventCard
                    key={subEvent._id}
                    event={subEvent}
                    currentUserId={userId}
                    user={user}
                    likedEvent={subEventLikedEvent}
                    page="event-detail"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Related Events */}
        {!event.parentEvent && relatedEvents.length > 0 && (
          <div className="pb-24 lg:pb-32 border-t border-border pt-16 lg:pt-24">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-12 h-px bg-foreground/30" />
              More to explore
            </span>
            <h2 className="text-5xl md:text-6xl font-display tracking-tight leading-[0.92] mb-12 lg:mb-16">
              Related<br />
              <span className="text-muted-foreground">events.</span>
            </h2>
            <EventCards
              events={relatedEvents}
              currentUserId={userId}
              emptyTitle="No Related Events Found"
              emptyStateSubtext="Check out other events below"
              user={user}
              page="event-detail"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
