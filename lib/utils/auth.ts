import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '../actions/user.action';
import {
	checkUserPermission,
	getUserHighestRole,
} from '../actions/userrole.action';
import { getEventById } from '../actions/event.action';
import {
	UserRoleType,
	IUserRole,
	PermissionType,
} from '../models/userrole.model';

export interface AuthContext {
	userId: string | null;
	clerkId: string | null;
	mongoUser: any;
	isAuthenticated: boolean;
}

export interface EventAuthContext extends AuthContext {
	event: any;
	userRole: UserRoleType | null;
	permissions: IUserRole['permissions'];
	isOrganizer: boolean;
	canAccess: boolean;
}

/**
 * Get current authentication context
 */
export async function getAuthContext(): Promise<AuthContext> {
	try {
		const { userId: clerkId } = await auth();

		if (!clerkId) {
			return {
				userId: null,
				clerkId: null,
				mongoUser: null,
				isAuthenticated: false,
			};
		}

		const mongoUser = await getUserByClerkId(clerkId);

		return {
			userId: mongoUser?._id?.toString() || null,
			clerkId,
			mongoUser,
			isAuthenticated: !!mongoUser,
		};
	} catch (error) {
		console.error('Error getting auth context:', error);
		return {
			userId: null,
			clerkId: null,
			mongoUser: null,
			isAuthenticated: false,
		};
	}
}

/**
 * Get event-specific authentication context with role and permissions
 */
export async function getEventAuthContext(
	eventId: string
): Promise<EventAuthContext> {
	const authContext = await getAuthContext();

	if (!authContext.isAuthenticated || !authContext.userId) {
		return {
			...authContext,
			event: null,
			userRole: null,
			permissions: {},
			isOrganizer: false,
			canAccess: false,
		};
	}

	try {
		const event = await getEventById(eventId);

		if (!event) {
			return {
				...authContext,
				event: null,
				userRole: null,
				permissions: {},
				isOrganizer: false,
				canAccess: false,
			};
		}

		// Check if user is the original organizer
		const isOrganizer = event.organizer._id.toString() === authContext.userId;

		// Get user's highest role for this event
		const userRole = await getUserHighestRole(authContext.userId, eventId);

		// Get permissions based on role
		let permissions: IUserRole['permissions'] = {};
		if (userRole) {
			// Get specific permissions for this user/event combination
			const hasManageEvent = await checkUserPermission(
				authContext.userId,
				eventId,
				'canManageEvent'
			);
			const hasVerifyTickets = await checkUserPermission(
				authContext.userId,
				eventId,
				'canVerifyTickets'
			);
			const hasViewAttendees = await checkUserPermission(
				authContext.userId,
				eventId,
				'canViewAttendees'
			);
			const hasManageStakeholders = await checkUserPermission(
				authContext.userId,
				eventId,
				'canManageStakeholders'
			);
			const hasViewAnalytics = await checkUserPermission(
				authContext.userId,
				eventId,
				'canViewAnalytics'
			);
			const hasSendUpdates = await checkUserPermission(
				authContext.userId,
				eventId,
				'canSendUpdates'
			);
			const hasManageCertificates = await checkUserPermission(
				authContext.userId,
				eventId,
				'canManageCertificates'
			);
			const hasManageGallery = await checkUserPermission(
				authContext.userId,
				eventId,
				'canManageGallery'
			);

			permissions = {
				canManageEvent: hasManageEvent,
				canVerifyTickets: hasVerifyTickets,
				canViewAttendees: hasViewAttendees,
				canManageStakeholders: hasManageStakeholders,
				canViewAnalytics: hasViewAnalytics,
				canSendUpdates: hasSendUpdates,
				canManageCertificates: hasManageCertificates,
				canManageGallery: hasManageGallery,
			};
		}

		// User can access if they have any role or are the organizer
		const canAccess = isOrganizer || userRole !== null;

		return {
			...authContext,
			event,
			userRole,
			permissions,
			isOrganizer,
			canAccess,
		};
	} catch (error) {
		console.error('Error getting event auth context:', error);
		return {
			...authContext,
			event: null,
			userRole: null,
			permissions: {},
			isOrganizer: false,
			canAccess: false,
		};
	}
}

/**
 * Check if user has permission to access event management features
 */
export async function canAccessEventManagement(
	userId: string,
	eventId: string
): Promise<boolean> {
	try {
		const event = await getEventById(eventId);
		if (!event) return false;

		// Original organizer always has access
		if (event.organizer._id.toString() === userId) {
			return true;
		}

		// Check if user has management permissions through roles
		const hasManagePermission = await checkUserPermission(
			userId,
			eventId,
			'canManageEvent'
		);
		const hasVerifyPermission = await checkUserPermission(
			userId,
			eventId,
			'canVerifyTickets'
		);
		const hasViewPermission = await checkUserPermission(
			userId,
			eventId,
			'canViewAttendees'
		);

		return hasManagePermission || hasVerifyPermission || hasViewPermission;
	} catch (error) {
		console.error('Error checking event management access:', error);
		return false;
	}
}

/**
 * Check if user has specific permission for an event
 */
export async function hasEventPermission(
	userId: string,
	eventId: string,
	permission: PermissionType
): Promise<boolean> {
	try {
		const event = await getEventById(eventId);
		if (!event) return false;

		// Original organizer always has all permissions
		if (event.organizer._id.toString() === userId) {
			return true;
		}

		// Check role-based permission
		return await checkUserPermission(userId, eventId, permission);
	} catch (error) {
		console.error('Error checking event permission:', error);
		return false;
	}
}

/**
 * Require authentication and return auth context
 */
export async function requireAuth(): Promise<AuthContext> {
	const authContext = await getAuthContext();

	if (!authContext.isAuthenticated) {
		throw new Error('Authentication required');
	}

	return authContext;
}

/**
 * Require event access and return event auth context
 */
export async function requireEventAccess(
	eventId: string
): Promise<EventAuthContext> {
	const eventAuthContext = await getEventAuthContext(eventId);

	if (!eventAuthContext.isAuthenticated) {
		throw new Error('Authentication required');
	}

	if (!eventAuthContext.canAccess) {
		throw new Error(
			'Access denied: You do not have permission to access this event'
		);
	}

	return eventAuthContext;
}

/**
 * Require specific permission for an event
 */
export async function requireEventPermission(
	eventId: string,
	permission: keyof IUserRole['permissions']
): Promise<EventAuthContext> {
	const eventAuthContext = await requireEventAccess(eventId);

	const hasPermission =
		eventAuthContext.isOrganizer ||
		eventAuthContext.permissions?.[permission] === true;

	if (!hasPermission) {
		throw new Error(
			`Access denied: You do not have permission to ${(permission as string)
				.replace('can', '')
				.toLowerCase()}`
		);
	}

	return eventAuthContext;
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRoleType): string {
	const roleNames: Record<UserRoleType, string> = {
		organizer: 'Organizer',
		volunteer: 'Volunteer',
		speaker: 'Speaker',
		participant: 'Participant',
	};

	return roleNames[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRoleType): string {
	const roleColors: Record<UserRoleType, string> = {
		organizer: 'bg-red-100 text-red-800',
		volunteer: 'bg-green-100 text-green-800',
		speaker: 'bg-blue-100 text-blue-800',
		participant: 'bg-gray-100 text-gray-800',
	};

	return roleColors[role] || 'bg-gray-100 text-gray-800';
}
