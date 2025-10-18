import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '@/lib/actions/user.action';
import { getEventById } from '@/lib/actions/event.action';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await getUserByClerkId(userId);
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const { eventId, stakeholderId, email, role } = await request.json();

		if (!eventId || !email || !role) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Get event details
		const event = await getEventById(eventId);
		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Check if user has permission to send emails for this event
		if (event.organizer._id.toString() !== user._id.toString()) {
			return NextResponse.json(
				{ error: 'Only event organizers can send stakeholder emails' },
				{ status: 403 }
			);
		}

		// Format event date and time
		const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		const eventTime = `${event.startTime} - ${event.endTime}`;

		// Role-specific content
		const roleContent = {
			volunteer: {
				title: 'Volunteer Information',
				description:
					'Thank you for volunteering! Your help is essential to making this event successful.',
				responsibilities: [
					'Assist with event setup and breakdown',
					'Help guide attendees and answer questions',
					'Support event activities as needed',
					'Ensure a positive experience for all participants',
				],
			},
			speaker: {
				title: 'Speaker Information',
				description: 'We are excited to have you as a speaker at our event!',
				responsibilities: [
					'Prepare and deliver your presentation',
					'Engage with attendees during Q&A sessions',
					'Arrive 30 minutes before your scheduled time',
					'Share your expertise and insights with participants',
				],
			},
		};

		const roleInfo =
			roleContent[role as keyof typeof roleContent] || roleContent.volunteer;

		// Create professional HTML email
		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Details - ${event.title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Event Details</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">${
								roleInfo.title
							}</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0; line-height: 1.6;">
                ${roleInfo.description}
              </p>

              <!-- Event Details Card -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #667eea;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">${
									event.title
								}</h2>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-weight: 600;">📅 Date:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${eventDate}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-weight: 600;">⏰ Time:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${eventTime}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-weight: 600;">📍 Location:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${
										event.location || 'TBA'
									}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151; font-weight: 600;">👤 Your Role:</strong>
                  <span style="color: #667eea; margin-left: 8px; font-weight: 600; text-transform: capitalize;">${role}</span>
                </div>
              </div>

              <!-- Role Responsibilities -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Your Responsibilities:</h3>
                <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0;">
                  ${roleInfo.responsibilities
										.map(
											(responsibility) =>
												`<li style="margin-bottom: 8px;">${responsibility}</li>`
										)
										.join('')}
                </ul>
              </div>

              <!-- Event Description -->
              ${
								event.description
									? `
                <div style="margin: 30px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">About the Event:</h3>
                  <p style="color: #374151; line-height: 1.6; margin: 0;">${event.description}</p>
                </div>
              `
									: ''
							}

              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/event/${
			event._id
		}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  View Event Details
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 40px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; line-height: 1.5;">
                  If you have any questions, please don't hesitate to reach out to the event organizer.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                  Best regards,<br>
                  <strong>${user.firstName} ${user.lastName}</strong><br>
                  Event Organizer
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

		// Send email
		const emailResult = await resend.emails.send({
			from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
			to: email,
			subject: `Event Details: ${event.title} - ${roleInfo.title}`,
			html: htmlContent,
		});

		if (emailResult.error) {
			console.error('Resend error:', emailResult.error);
			return NextResponse.json(
				{ error: 'Failed to send email' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: `Event details sent successfully to ${email}`,
			emailId: emailResult.data?.id,
		});
	} catch (error) {
		console.error('Error sending stakeholder email:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
