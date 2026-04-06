"use client";

import React from "react";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { IEvent } from "@/lib/models/event.model";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCreatorDashboardProps {
  events: IEvent[];
}

export default function EventCreatorDashboard({
  events,
}: EventCreatorDashboardProps) {
  // Calculate dashboard stats
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (event) => new Date(event.endDate) > new Date(),
  ).length;
  const totalAttendees = events.reduce(
    (sum, event) => sum + (event.attendees?.length || 0),
    0,
  );
  const avgAttendeesPerEvent =
    totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;

  // Get upcoming events with attendee data
  const upcomingEvents = events
    .filter((event) => new Date(event.startDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-card rounded-xl p-8 border border-border relative overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display">
              Event Creator Dashboard
            </h2>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted/40 border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Events
              </span>
            </div>
            <p className="text-4xl font-display text-foreground">{totalEvents}</p>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Active Events
              </span>
            </div>
            <p className="text-4xl font-display text-foreground">{activeEvents}</p>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Attendees
              </span>
            </div>
            <p className="text-4xl font-display text-foreground">
              {totalAttendees}
            </p>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Avg. Attendees
              </span>
            </div>
            <p className="text-4xl font-display text-foreground">
              {avgAttendeesPerEvent}
            </p>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Upcoming Events
            </h3>
            {upcomingEvents.map((event, index) => (
              <div
                key={String(event._id)}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2 text-foreground">
                      {event.title}
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span>
                          {formatDate(event.startDate.toString())},{" "}
                          {formatTime(event.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{event.landmark || "Online"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={event.isFree ? "secondary" : "default"}
                        className="bg-red-100 text-red-700 border-red-300"
                      >
                        {event.isFree ? "Free" : `₹${event.price}`}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-300"
                      >
                        {(event.category as any)?.name || "Uncategorized"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">
                      {event.attendees?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      attendees
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {event.ticketsLeft !== undefined &&
                      event.ticketsLeft !== -1 && (
                        <span className="font-medium">
                          {event.ticketsLeft} tickets remaining
                        </span>
                      )}
                    {event.ticketsLeft === -1 && (
                      <span className="font-medium">Unlimited tickets</span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted rounded-full"
                    >
                      <Link href={`/event/${event._id}`}>View Event</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted rounded-full"
                    >
                      <Link href={`/event/${event._id}/attendees`}>
                        Attendees
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-full"
                    >
                      <Link href={`/event/${event._id}/update`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
