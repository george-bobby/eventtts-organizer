'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCards from "./EventCards";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/utils/auth";
import { UserRoleType } from "@/lib/models/userrole.model";
import { 
  Users, 
  Mic, 
  HandHeart, 
  Ticket,
  Calendar,
  Settings,
  Eye,
  UserCheck
} from "lucide-react";

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
  mongoUser 
}: RoleBasedEventSectionsProps) => {
  
  const roleConfigs = [
    {
      role: 'organizer' as UserRoleType,
      title: 'Events I\'m Organizing',
      description: 'Events where you have full management control',
      icon: Settings,
      gradient: 'from-red-500 to-red-600',
      events: eventsByRole.organizer,
      emptyTitle: 'No events organized yet',
      emptySubtext: 'Create your first event to get started!',
      actionButton: {
        text: 'Create New Event',
        href: '/create'
      }
    },
    {
      role: 'volunteer' as UserRoleType,
      title: 'Events I\'m Volunteering For',
      description: 'Events where you help with operations and attendee management',
      icon: HandHeart,
      gradient: 'from-green-500 to-green-600',
      events: eventsByRole.volunteer,
      emptyTitle: 'No volunteer assignments yet',
      emptySubtext: 'You\'ll see events here when organizers assign you as a volunteer',
      actionButton: {
        text: 'Explore Events',
        href: '/explore'
      }
    },
    {
      role: 'speaker' as UserRoleType,
      title: 'Events I\'m Speaking At',
      description: 'Events where you\'re presenting or speaking',
      icon: Mic,
      gradient: 'from-blue-500 to-blue-600',
      events: eventsByRole.speaker,
      emptyTitle: 'No speaking engagements yet',
      emptySubtext: 'You\'ll see events here when organizers assign you as a speaker',
      actionButton: {
        text: 'Explore Events',
        href: '/explore'
      }
    },
    {
      role: 'participant' as UserRoleType,
      title: 'Events I\'m Attending',
      description: 'Events you\'ve registered for or have tickets to',
      icon: Ticket,
      gradient: 'from-purple-500 to-purple-600',
      events: eventsByRole.participant,
      emptyTitle: 'No event tickets yet',
      emptySubtext: 'Discover and register for exciting events!',
      actionButton: {
        text: 'Explore Events',
        href: '/explore'
      }
    }
  ];

  // Filter out empty sections for cleaner display
  const sectionsToShow = roleConfigs.filter(config => config.events.length > 0);

  // If no role-based events, show a welcome message
  if (sectionsToShow.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">My Event Roles</h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No Role Assignments Yet</h4>
          <p className="text-gray-600 mb-6">
            You'll see events here when organizers assign you roles like volunteer, speaker, or when you register for events.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/explore">Explore Events</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/create">Create Event</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sectionsToShow.map((config) => {
        const IconComponent = config.icon;
        
        return (
          <section key={config.role} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${config.gradient} px-8 py-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">{config.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {config.events.length} {config.events.length === 1 ? 'Event' : 'Events'}
                  </Badge>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-white text-gray-700 hover:bg-gray-100 font-semibold hidden sm:flex"
                  >
                    <Link href={config.actionButton.href}>{config.actionButton.text}</Link>
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
                showRoleBadge={true}
                isBookedEvent={config.role === 'participant'}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default RoleBasedEventSections;
