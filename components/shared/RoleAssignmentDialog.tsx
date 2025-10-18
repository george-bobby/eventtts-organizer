'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { UserRoleType } from '@/lib/models/userrole.model';
import { getRoleDisplayName } from '@/lib/utils/auth';
import RoleBadge from './RoleBadge';

interface RoleAssignmentDialogProps {
  eventId: string;
  userId: string;
  currentRole?: UserRoleType;
  onRoleAssigned?: (role: UserRoleType) => void;
  trigger?: React.ReactNode;
}

const RoleAssignmentDialog: React.FC<RoleAssignmentDialogProps> = ({
  eventId,
  userId,
  currentRole,
  onRoleAssigned,
  trigger
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRoleType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const roles: UserRoleType[] = ['organizer', 'volunteer', 'speaker', 'participant'];

  const handleAssignRole = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventId,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        onRoleAssigned?.(selectedRole);
        setIsOpen(false);
        setSelectedRole('');
      } else {
        const error = await response.json();
        console.error('Failed to assign role:', error);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: UserRoleType) => {
    const descriptions = {
      organizer: 'Full access to manage all aspects of the event',
      volunteer: 'Can verify tickets, check-in participants, and view attendee lists',
      speaker: 'Can view event details, participant info, and manage presentation materials',
      participant: 'Can view own tickets, report issues, and read-only event access'
    };
    return descriptions[role];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Event Role</DialogTitle>
          <DialogDescription>
            Assign a role to this user for the event. This will determine their permissions and access level.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentRole && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">Current Role</Label>
              <div className="mt-1">
                <RoleBadge role={currentRole} size="sm" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role-select">Select New Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRoleType)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <span>{getRoleDisplayName(role)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedRole && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RoleBadge role={selectedRole} size="sm" />
                </div>
                <p className="text-sm text-gray-600">
                  {getRoleDescription(selectedRole)}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignRole} 
            disabled={!selectedRole || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleAssignmentDialog;
