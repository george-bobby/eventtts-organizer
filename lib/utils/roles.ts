export type UserRoleType = 'organizer' | 'volunteer' | 'speaker' | 'participant';

export function getRoleDisplayName(role: UserRoleType): string {
	const roleNames: Record<UserRoleType, string> = {
		organizer: 'Organizer',
		volunteer: 'Volunteer',
		speaker: 'Speaker',
		participant: 'Participant',
	};
	return roleNames[role] || role;
}

export function getRoleBadgeColor(role: UserRoleType): string {
	const roleColors: Record<UserRoleType, string> = {
		organizer: 'bg-red-100 text-red-800',
		volunteer: 'bg-green-100 text-green-800',
		speaker: 'bg-blue-100 text-blue-800',
		participant: 'bg-gray-100 text-gray-800',
	};
	return roleColors[role] || 'bg-gray-100 text-gray-800';
}
