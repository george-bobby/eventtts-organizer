'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Users, Search, Mail, Loader2 } from 'lucide-react';
import RoleBadge from './RoleBadge';

interface StakeholderManagementProps {
  eventId: string;
  stakeholders: any[];
  stats: any;
  filters: {
    role?: string;
    search?: string;
  };
}

export default function StakeholderManagement({
  eventId,
  stakeholders,
  stats,
  filters,
}: StakeholderManagementProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  const [newStakeholder, setNewStakeholder] = useState({
    email: '',
    role: 'volunteer',
  });

  // Filter stakeholders based on search and role
  const filteredStakeholders = stakeholders.filter((stakeholder) => {
    const matchesSearch = !searchTerm ||
      stakeholder.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stakeholder.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || stakeholder.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleAddStakeholder = async () => {
    if (!newStakeholder.email || !newStakeholder.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send invitation email and create stakeholder
      const response = await fetch('/api/stakeholders/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          email: newStakeholder.email,
          role: newStakeholder.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: result.message || 'Invitation sent successfully',
      });

      setIsAddDialogOpen(false);
      setNewStakeholder({
        email: '',
        role: 'volunteer',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedRole !== 'all') params.set('role', selectedRole);

    router.push(`/event/${eventId}/stakeholders?${params.toString()}`);
  };

  const handleSendEmail = async (stakeholder: any) => {
    try {
      setIsSendingEmail(stakeholder._id);

      const response = await fetch(`/api/stakeholders/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          stakeholderId: stakeholder._id,
          email: stakeholder.email,
          role: stakeholder.role,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Email sent successfully',
          description: `Event details sent to ${stakeholder.email}`,
        });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Stakeholders</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Volunteers</p>
                <p className="text-2xl font-bold">{stats?.volunteers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Speakers</p>
                <p className="text-2xl font-bold">{stats?.speakers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Organizers</p>
                <p className="text-2xl font-bold">{stats?.organizers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Stakeholder Management</CardTitle>
              <CardDescription>
                Invite volunteers and speakers to your event via email
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Stakeholder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Stakeholder</DialogTitle>
                  <DialogDescription>
                    Send an email invitation to assign a role for this event
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newStakeholder.email}
                      onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newStakeholder.role}
                      onValueChange={(value) => setNewStakeholder({ ...newStakeholder, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="speaker">Speaker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStakeholder} disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="speaker">Speaker</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Stakeholders Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStakeholders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No stakeholders found</p>
                        <p className="text-sm text-gray-400">
                          Start by inviting volunteers and speakers to your event
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStakeholders.map((stakeholder) => (
                    <TableRow key={stakeholder._id}>
                      <TableCell className="font-medium">{stakeholder.email}</TableCell>
                      <TableCell>{stakeholder.name || 'N/A'}</TableCell>
                      <TableCell>
                        <RoleBadge role={stakeholder.role} size="sm" />
                      </TableCell>
                      <TableCell>
                        <Badge variant={stakeholder.attendanceStatus === 'confirmed' ? 'default' : 'secondary'}>
                          {stakeholder.attendanceStatus || 'invited'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(stakeholder)}
                          disabled={isSendingEmail === stakeholder._id}
                        >
                          {isSendingEmail === stakeholder._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}