"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCards from "./EventCards";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/utils/roles";
import { UserRoleType } from "@/lib/models/userrole.model";
import { Mic, HandHeart, Ticket, Settings } from "lucide-react";

interface RoleBasedEventSectionsProps {
  eventsByRole: {
    organizer: any[];
    volunteer: any[];
    speaker: any[];
    participant: any[];
  };
  currentUserId: string;
  mongoUser: any;
}

const RoleBasedEventSections = ({
  eventsByRole,
  currentUserId,
  mongoUser,
}: RoleBasedEventSectionsProps) => {
  const roleConfigs = [
    {
      role: "organizer" as UserRoleType,
      title: "Events I'm Organizing",
      description: "Events where you have full management control",
      icon: Settings,
      gradient: "from-red-500 to-red-600",
      events: eventsByRole.organizer,
      emptyTitle: "No events organized yet",
      emptySubtext: "Create your first event to get started!",
      actionButton: {
        text: "Create New Event",
        href: "/create",
      },
    },
    {
      role: "volunteer" as UserRoleType,
      title: "Events I'm Volunteering For",
      description:
        "Events where you help with operations and attendee management",
      icon: HandHeart,
      gradient: "from-green-500 to-green-600",
      events: eventsByRole.volunteer,
      emptyTitle: "No volunteer assignments yet",
      emptySubtext:
        "You'll see events here when organizers assign you as a volunteer",
      actionButton: {
        text: "Explore Events",
        href: "/explore",
      },
    },
    {
      role: "speaker" as UserRoleType,
      title: "Events I'm Speaking At",
      description: "Events where you're presenting or speaking",
      icon: Mic,
      gradient: "from-blue-500 to-blue-600",
      events: eventsByRole.speaker,
      emptyTitle: "No speaking engagements yet",
      emptySubtext:
        "You'll see events here when organizers assign you as a speaker",
      actionButton: {
        text: "Explore Events",
        href: "/explore",
      },
    },
    {
      role: "participant" as UserRoleType,
      title: "Events I'm Attending",
      description: "Events you've registered for or have tickets to",
      icon: Ticket,
      gradient: "from-purple-500 to-purple-600",
      events: eventsByRole.participant,
      emptyTitle: "No event tickets yet",
      emptySubtext: "Discover and register for exciting events!",
      actionButton: {
        text: "Explore Events",
        href: "/explore",
      },
    },
  ];

  // Only show sections that have events
  const sectionsToShow = roleConfigs.filter(
    (config) => config.events.length > 0,
  );

  // If no role-based events, show a welcome message
  if (sectionsToShow.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/40 border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
                <Settings className="w-5 h-5 text-background" />
              </div>
              <h3 className="text-2xl font-bold text-foreground font-display">My Event Roles</h3>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 text-muted-foreground mx-auto mb-4">
            <Settings className="w-full h-full" />
          </div>
          <h4 className="text-xl font-semibold text-foreground mb-2">
            No Role Assignments Yet
          </h4>
          <p className="text-muted-foreground mb-6">
            You'll see events here when organizers assign you roles like
            volunteer, speaker, or when you register for events.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sectionsToShow.map((config) => {
        const IconComponent = config.icon;

        return (
          <section
            key={config.role}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="bg-muted/40 border-b border-border px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
                    <IconComponent className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground font-display">
                      {config.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-background text-foreground border-border">
                    {config.events.length}{" "}
                    {config.events.length === 1 ? "Event" : "Events"}
                  </Badge>
                  <Button
                    asChild
                    size="lg"
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-full font-semibold hidden sm:flex"
                  >
                    <Link href={config.actionButton.href}>
                      {config.actionButton.text}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-8">
              <EventCards
                events={config.events}
                currentUserId={currentUserId}
                emptyTitle={config.emptyTitle}
                emptyStateSubtext={config.emptySubtext}
                page="profile"
                user={mongoUser}
                isBookedEvent={config.role === "participant"}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default RoleBasedEventSections;
