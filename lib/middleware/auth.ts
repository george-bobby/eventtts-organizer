import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '../actions/user.action';
import { hasEventPermission, canAccessEventManagement } from '../utils/auth';
import { IUserRole, PermissionType } from '../models/userrole.model';

export interface AuthenticatedRequest extends NextRequest {
	user?: {
		clerkId: string;
		mongoId: string;
		mongoUser: any;
	};
}

/**
 * Middleware to require authentication
 */
export async function withAuth(
	handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
	return async (req: NextRequest) => {
		try {
			const { userId: clerkId } = await auth();

			if (!clerkId) {
				return NextResponse.json(
					{ error: 'Authentication required' },
					{ status: 401 }
				);
			}

			const mongoUser = await getUserByClerkId(clerkId);
			if (!mongoUser) {
				return NextResponse.json({ error: 'User not found' }, { status: 404 });
			}

			// Add user info to request
			const authenticatedReq = req as AuthenticatedRequest;
			authenticatedReq.user = {
				clerkId,
				mongoId: mongoUser._id.toString(),
				mongoUser,
			};

			return await handler(authenticatedReq);
		} catch (error) {
			console.error('Auth middleware error:', error);
			return NextResponse.json(
				{ error: 'Authentication failed' },
				{ status: 500 }
			);
		}
	};
}

/**
 * Middleware to require event access (any role)
 */
export async function withEventAccess(
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string
) {
	return withAuth(async (req: AuthenticatedRequest) => {
		try {
			const eventId = getEventId(req);

			if (!eventId) {
				return NextResponse.json(
					{ error: 'Event ID is required' },
					{ status: 400 }
				);
			}

			const canAccess = await canAccessEventManagement(
				req.user!.mongoId,
				eventId
			);

			if (!canAccess) {
				return NextResponse.json(
					{
						error:
							'Access denied: You do not have permission to access this event',
					},
					{ status: 403 }
				);
			}

			return await handler(req, eventId);
		} catch (error) {
			console.error('Event access middleware error:', error);
			return NextResponse.json(
				{ error: 'Access check failed' },
				{ status: 500 }
			);
		}
	});
}

/**
 * Middleware to require specific event permission
 */
export async function withEventPermission(
	permission: PermissionType,
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string
) {
	return withAuth(async (req: AuthenticatedRequest) => {
		try {
			const eventId = getEventId(req);

			if (!eventId) {
				return NextResponse.json(
					{ error: 'Event ID is required' },
					{ status: 400 }
				);
			}

			const hasPermission = await hasEventPermission(
				req.user!.mongoId,
				eventId,
				permission
			);

			if (!hasPermission) {
				return NextResponse.json(
					{
						error: `Access denied: You do not have permission to ${permission
							.replace('can', '')
							.toLowerCase()}`,
					},
					{ status: 403 }
				);
			}

			return await handler(req, eventId);
		} catch (error) {
			console.error('Event permission middleware error:', error);
			return NextResponse.json(
				{ error: 'Permission check failed' },
				{ status: 500 }
			);
		}
	});
}

/**
 * Helper to extract event ID from URL params
 */
export function getEventIdFromParams(req: NextRequest): string {
	const url = new URL(req.url);
	const pathSegments = url.pathname.split('/');
	const eventIndex = pathSegments.findIndex((segment) => segment === 'event');

	if (eventIndex !== -1 && eventIndex + 1 < pathSegments.length) {
		return pathSegments[eventIndex + 1];
	}

	return '';
}

/**
 * Helper to extract event ID from query params
 */
export function getEventIdFromQuery(req: NextRequest): string {
	const { searchParams } = new URL(req.url);
	return searchParams.get('eventId') || '';
}

/**
 * Helper to extract event ID from request body
 */
export async function getEventIdFromBody(req: NextRequest): Promise<string> {
	try {
		const body = await req.json();
		return body.eventId || '';
	} catch {
		return '';
	}
}

/**
 * Common middleware combinations
 */

// Require management permissions (organizer, volunteer with management rights)
export const withManagementAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canManageEvent', handler, getEventId);

// Require ticket verification permissions (organizer, volunteer)
export const withTicketAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canVerifyTickets', handler, getEventId);

// Require attendee viewing permissions (organizer, volunteer, speaker)
export const withAttendeeAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canViewAttendees', handler, getEventId);

// Require stakeholder management permissions (organizer only)
export const withStakeholderAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canManageStakeholders', handler, getEventId);

// Require analytics viewing permissions (organizer only)
export const withAnalyticsAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canViewAnalytics', handler, getEventId);

// Require update sending permissions (organizer only)
export const withUpdateAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canSendUpdates', handler, getEventId);

// Require certificate management permissions (organizer only)
export const withCertificateAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canManageCertificates', handler, getEventId);

// Require gallery management permissions (organizer, speaker)
export const withGalleryAccess = (
	handler: (
		req: AuthenticatedRequest,
		eventId: string
	) => Promise<NextResponse>,
	getEventId: (req: NextRequest) => string = getEventIdFromParams
) => withEventPermission('canManageGallery', handler, getEventId);
