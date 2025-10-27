import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId, getUserByEmail } from '@/lib/actions/user.action';
import { getEventById } from '@/lib/actions/event.action';
import { createStakeholder } from '@/lib/actions/stakeholder.action';
import { assignRoleFromStakeholder } from '@/lib/actions/userrole.action';
import { hasEventPermission } from '@/lib/utils/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/stakeholders/invite - Send email invitation and create stakeholder
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { eventId, email, role } = body;

		if (!eventId || !email || !role) {
			return NextResponse.json(
				{ error: 'Event ID, email, and role are required' },
				{ status: 400 }
			);
		}

		// Validate role
		if (!['volunteer', 'speaker'].includes(role)) {
			return NextResponse.json(
				{
					error:
						'Invalid role. Only volunteer and speaker roles can be invited.',
				},
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

		// Get event details for email
		const event = await getEventById(eventId);
		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Check if user exists by email
		const existingUser = await getUserByEmail(email);

		if (existingUser) {
			// User exists - assign role directly and don't send email
			try {
				await assignRoleFromStakeholder(
					existingUser._id.toString(),
					eventId,
					role,
					user._id.toString()
				);

				// Create stakeholder entry with user's name
				await createStakeholder({
					eventId,
					email,
					role,
					name: `${existingUser.firstName} ${existingUser.lastName}`.trim(),
					importedBy: user._id.toString(),
				});

				return NextResponse.json({
					success: true,
					message: `Role assigned successfully to existing user ${existingUser.firstName} ${existingUser.lastName}`,
					userExists: true,
				});
			} catch (error) {
				console.error('Error assigning role to existing user:', error);
				return NextResponse.json(
					{ error: 'Failed to assign role to existing user' },
					{ status: 500 }
				);
			}
		}

		// User doesn't exist - create stakeholder entry and send invitation email
		try {
			await createStakeholder({
				eventId,
				email,
				role,
				name: email.split('@')[0], // Use email prefix as temporary name
				importedBy: user._id.toString(),
			});
		} catch (error) {
			console.error('Error creating stakeholder:', error);
			return NextResponse.json(
				{ error: 'Failed to create stakeholder entry' },
				{ status: 500 }
			);
		}

		// Send email invitation
		const roleDisplayNames = {
			volunteer: 'Volunteer',
			speaker: 'Speaker',
		};

		const roleDescriptions = {
			volunteer:
				'Help with event operations, ticket verification, and attendee assistance',
			speaker: 'Present at the event and engage with participants',
		};

		const emailSubject = `You're invited as a ${
			roleDisplayNames[role as keyof typeof roleDisplayNames]
		} for ${event.title}`;

		const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Role Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Event Role Invitation</h2>
            
            <p>Hello!</p>
            
            <p>You have been invited to participate in <strong>${
							event.title
						}</strong> as a <strong>${
			roleDisplayNames[role as keyof typeof roleDisplayNames]
		}</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #495057;">Event Details</h3>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Date:</strong> ${new Date(
								event.startDate
							).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${event.startTime}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Your Role:</strong> ${
								roleDisplayNames[role as keyof typeof roleDisplayNames]
							}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976d2;">As a ${
								roleDisplayNames[role as keyof typeof roleDisplayNames]
							}, you will:</h4>
              <p style="margin-bottom: 0;">${
								roleDescriptions[role as keyof typeof roleDescriptions]
							}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/event/${eventId}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                View Event Details
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
              If you don't have an account yet, you'll need to <a href="${
								process.env.NEXT_PUBLIC_SERVER_URL
							}/sign-up" style="color: #667eea;">sign up</a> to access your role features.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6c757d; text-align: center;">
              This invitation was sent by ${user.firstName} ${
			user.lastName
		} for the event "${event.title}".
              <br>
              If you have any questions, please contact the event organizer.
            </p>
          </div>
        </body>
      </html>
    `;

		try {
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
				to: [email],
				subject: emailSubject,
				html: emailHtml,
			});

			return NextResponse.json({
				success: true,
				message: `Invitation sent successfully to ${email}`,
			});
		} catch (emailError) {
			console.error('Error sending email:', emailError);
			return NextResponse.json(
				{
					error: 'Failed to send email invitation',
					message: 'Stakeholder was created but email could not be sent',
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Error in stakeholder invitation:', error);
		return NextResponse.json(
			{
				error: 'Failed to process invitation',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
