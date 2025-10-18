import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '@/lib/actions/user.action';
import { hasEventPermission } from '@/lib/utils/auth';
import {
	createUserRole,
	getUserRoles,
	updateUserRole,
	removeUserRole,
} from '@/lib/actions/userrole.action';

/**
 * GET /api/user-roles - Get user roles for an event
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const eventId = searchParams.get('eventId');
		const targetUserId = searchParams.get('userId');

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Event ID is required' },
				{ status: 400 }
			);
		}

		// Check if user has permission to view attendees/stakeholders
		const user = await getUserByClerkId(userId);
		const canViewAttendees = await hasEventPermission(
			user._id.toString(),
			eventId,
			'canViewAttendees'
		);

		if (!canViewAttendees) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const filters: any = { event: eventId };
		if (targetUserId) {
			filters.user = targetUserId;
		}

		const userRoles = await getUserRoles(filters);

		return NextResponse.json({
			success: true,
			data: userRoles,
		});
	} catch (error) {
		console.error('Error getting user roles:', error);
		return NextResponse.json(
			{
				error: 'Failed to get user roles',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/user-roles - Create a new user role assignment
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { userId: targetUserId, eventId, role } = body;

		if (!targetUserId || !eventId || !role) {
			return NextResponse.json(
				{ error: 'User ID, Event ID, and role are required' },
				{ status: 400 }
			);
		}

		// Check if user has permission to manage stakeholders
		const user = await getUserByClerkId(userId);
		const canManageStakeholders = await hasEventPermission(
			user._id.toString(),
			eventId,
			'canManageStakeholders'
		);

		if (!canManageStakeholders) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const userRole = await createUserRole({
			userId: targetUserId,
			eventId,
			role,
			assignedBy: user._id.toString(),
		});

		return NextResponse.json({
			success: true,
			data: userRole,
		});
	} catch (error) {
		console.error('Error creating user role:', error);
		return NextResponse.json(
			{
				error: 'Failed to create user role',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/user-roles - Update a user role assignment
 */
export async function PATCH(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { userRoleId, role, eventId } = body;

		if (!userRoleId || !role || !eventId) {
			return NextResponse.json(
				{ error: 'User Role ID, Event ID, and role are required' },
				{ status: 400 }
			);
		}

		// Check if user has permission to manage stakeholders
		const user = await getUserByClerkId(userId);
		const canManageStakeholders = await hasEventPermission(
			user._id.toString(),
			eventId,
			'canManageStakeholders'
		);

		if (!canManageStakeholders) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const updatedUserRole = await updateUserRole({
			userRoleId,
			updates: { role },
		});

		return NextResponse.json({
			success: true,
			data: updatedUserRole,
		});
	} catch (error) {
		console.error('Error updating user role:', error);
		return NextResponse.json(
			{
				error: 'Failed to update user role',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/user-roles - Remove a user role assignment
 */
export async function DELETE(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const userRoleId = searchParams.get('userRoleId');
		const eventId = searchParams.get('eventId');

		if (!userRoleId || !eventId) {
			return NextResponse.json(
				{ error: 'User Role ID and Event ID are required' },
				{ status: 400 }
			);
		}

		// Check if user has permission to manage stakeholders
		const user = await getUserByClerkId(userId);
		const canManageStakeholders = await hasEventPermission(
			user._id.toString(),
			eventId,
			'canManageStakeholders'
		);

		if (!canManageStakeholders) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		await removeUserRole(userRoleId);

		return NextResponse.json({
			success: true,
			message: 'User role removed successfully',
		});
	} catch (error) {
		console.error('Error deleting user role:', error);
		return NextResponse.json(
			{
				error: 'Failed to delete user role',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
