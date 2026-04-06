import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateStakeholderRole } from '@/lib/actions/stakeholder.action';
import { getUserByClerkId } from '@/lib/actions/user.action';

/**
 * PATCH /api/stakeholders/[stakeholderId]/role - Update stakeholder role (admin only)
 */
export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ stakeholderId: string }> }
) {
	const params = await context.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get MongoDB user ID
		const mongoUser = await getUserByClerkId(userId);
		if (!mongoUser) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const body = await request.json();
		const { role } = body;

		if (!role) {
			return NextResponse.json(
				{ error: 'Role is required' },
				{ status: 400 }
			);
		}

		const validRoles = ['attendee', 'speaker', 'volunteer', 'organizer', 'sponsor'];
		if (!validRoles.includes(role)) {
			return NextResponse.json(
				{ error: 'Invalid role' },
				{ status: 400 }
			);
		}

		const stakeholder = await updateStakeholderRole(
			params.stakeholderId,
			role,
			mongoUser._id.toString()
		);

		return NextResponse.json({
			success: true,
			data: stakeholder,
		});
	} catch (error) {
		console.error('Error updating stakeholder role:', error);
		return NextResponse.json(
			{
				error: 'Failed to update stakeholder role',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

