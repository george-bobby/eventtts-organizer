'use server';

import { connectToDatabase } from '../dbconnection';
import { CertificateTemplate, Certificate } from '../models/certificate.model';
import { Stakeholder } from '../models/stakeholder.model';
import Event from '../models/event.model';
import User from '../models/user.model';
import { revalidatePath } from 'next/cache';
import jsPDF from 'jspdf';

import { getUserRoles } from './userrole.action';
import { getEventById } from './event.action';
import { getUserByClerkId } from './user.action';
import { Resend } from 'resend';

import {
	generateCertificateHTML as generateNewCertificateHTML,
	getSampleCertificateData,
	getTemplateById,
	getColorSchemeById,
	CERTIFICATE_TEMPLATES_NEW,
	COLOR_OPTIONS,
} from '../constants/certificate-template-manager';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateCertificateHTML(
	template: any,
	certificateData: {
		recipientName: string;
		eventName: string;
		organizerName: string;
		certificateType: string;
		eventDate: string;
		role: string;
	}
) {
	// Use new template system if template ID matches new templates
	const newTemplate = getTemplateById(template.style);
	if (newTemplate) {
		// Extract color scheme from template ID
		const colorId = template.id.includes('blue')
			? 'blue'
			: template.id.includes('purple')
			? 'purple'
			: template.id.includes('green')
			? 'green'
			: template.id.includes('orange')
			? 'orange'
			: template.id.includes('gold')
			? 'gold'
			: 'blue';

		return generateNewCertificateHTML(newTemplate.id, colorId, {
			recipientName: certificateData.recipientName,
			eventName: certificateData.eventName,
			organizerName: certificateData.organizerName,
			certificateType: certificateData.certificateType,
			eventDate: certificateData.eventDate,
			role: certificateData.role,
		});
	}

	// Fallback to old template system
	const { colors } = template;

	return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');

          .certificate {
            width: 800px;
            height: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%);
            border: 8px solid ${colors.primary};
            border-radius: 20px;
            position: relative;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
          }

          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
          }

          .content {
            position: relative;
            z-index: 2;
            padding: 60px 80px;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: white;
          }

          .logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: white;
          }

          .certificate-title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }

          .certificate-subtitle {
            font-size: 18px;
            margin-bottom: 30px;
            opacity: 0.9;
          }

          .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            margin: 20px 0;
            padding: 0 20px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.5);
            display: inline-block;
          }

          .event-details {
            font-size: 16px;
            margin: 20px 0;
            line-height: 1.6;
          }

          .organizer-signature {
            margin-top: 40px;
            font-size: 14px;
            opacity: 0.8;
          }

          .decorative-elements {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }

          .decorative-elements::before,
          .decorative-elements::after {
            content: '';
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
          }

          .decorative-elements::before {
            top: -50px;
            left: -50px;
          }

          .decorative-elements::after {
            bottom: -50px;
            right: -50px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="decorative-elements"></div>
          <div class="content">
            <div class="logo">🎉 EventTTS</div>
            <h1 class="certificate-title">Certificate of ${certificateData.certificateType}</h1>
            <p class="certificate-subtitle">This is to certify that</p>
            <div class="recipient-name">${certificateData.recipientName}</div>
            <div class="event-details">
              <p>has successfully participated as a <strong>${certificateData.role}</strong></p>
              <p>in the event</p>
              <p><strong>${certificateData.eventName}</strong></p>
              <p>held on ${certificateData.eventDate}</p>
            </div>
            <div class="organizer-signature">
              <p>Organized by: <strong>${certificateData.organizerName}</strong></p>
              <p>Event Organizer</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function generateCertificatesForRole(
	eventId: string,
	role: string,
	templateId: string,
	organizerId: string
) {
	try {
		await connectToDatabase();

		// Get event details
		const event = await getEventById(eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		// Verify organizer permission
		if (event.organizer._id.toString() !== organizerId) {
			throw new Error('Only event organizers can generate certificates');
		}

		// Type assertion for organizer (getEventById populates this field)
		const organizer = event.organizer as any;

		// Get template from new system
		const template = getTemplateById(templateId);
		if (!template) {
			throw new Error(`Template not found: ${templateId}`);
		}

		// Get users with the specified role
		const userRoles = await getUserRoles({
			eventId,
			role: role as any,
			isActive: true,
		});

		if (userRoles.length === 0) {
			console.warn(`No users found with role: ${role} for event: ${eventId}`);
			return {
				certificates: [],
				event: {
					title: event.title,
					date: new Date(event.startDate).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					}),
				},
				template: template?.name || 'Unknown Template',
				role,
				message: `No users found with role: ${role}. No certificates generated.`,
			};
		}

		// Format event date
		const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		// Generate certificates
		const certificates = [];
		for (const userRole of userRoles) {
			const user = userRole.user;
			const certificateData = {
				recipientName: `${user.firstName} ${user.lastName}`,
				eventName: event.title,
				organizerName: `${organizer.firstName || 'Event'} ${
					organizer.lastName || 'Organizer'
				}`,
				certificateType: role.charAt(0).toUpperCase() + role.slice(1),
				eventDate,
				role: role.charAt(0).toUpperCase() + role.slice(1),
			};

			const html = await generateCertificateHTML(template, certificateData);

			certificates.push({
				userId: user._id,
				userName: certificateData.recipientName,
				userEmail: user.email,
				html,
				filename: `${certificateData.recipientName.replace(
					/\s+/g,
					'_'
				)}_${role}_certificate.html`,
			});
		}

		return {
			certificates,
			event: {
				title: event.title,
				date: eventDate,
			},
			template: template.name,
			role,
		};
	} catch (error) {
		console.error('Error generating certificates:', error);
		throw error;
	}
}

export async function distributeCertificatesViaEmail(
	eventId: string,
	role: string,
	templateId: string,
	organizerClerkId: string
) {
	try {
		await connectToDatabase();

		// Get organizer user
		const organizer = await getUserByClerkId(organizerClerkId);
		if (!organizer) {
			throw new Error('Organizer not found');
		}

		// Generate certificates
		const result = await generateCertificatesForRole(
			eventId,
			role,
			templateId,
			organizer._id.toString()
		);

		// Check if any certificates were generated
		if (result.certificates.length === 0) {
			return {
				success: true,
				message:
					result.message ||
					`No users found with role: ${role}. No certificates distributed.`,
				emailsSent: 0,
				totalCertificates: 0,
				event: result.event,
				role,
			};
		}

		const emailResults = [];

		// Send emails with certificates
		for (const certificate of result.certificates) {
			try {
				const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Certificate Ready!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your participation certificate is attached</p>
            </div>

            <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Dear ${
								certificate.userName
							},</h2>
              <p style="color: #666; line-height: 1.6;">
                Congratulations! We are pleased to present you with your certificate of participation for the event:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${
									result.event.title
								}</h3>
                <p style="margin: 0; color: #666;">
                  <strong>Role:</strong> ${
										role.charAt(0).toUpperCase() + role.slice(1)
									}<br>
                  <strong>Date:</strong> ${result.event.date}<br>
                  <strong>Template:</strong> ${result.template}
                </p>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Your certificate is attached to this email as an HTML file. You can open it in any web browser and print it for your records.
              </p>
            </div>

            <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Thank you for your participation!<br>
                <strong>EventTTS Team</strong>
              </p>
            </div>
          </div>
        `;

				await resend.emails.send({
					from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
					to: certificate.userEmail,
					subject: `Your Certificate - ${result.event.title}`,
					html: emailHtml,
					attachments: [
						{
							filename: certificate.filename,
							content: Buffer.from(certificate.html).toString('base64'),
							contentType: 'text/html',
						},
					],
				});

				emailResults.push({
					userId: certificate.userId,
					userName: certificate.userName,
					email: certificate.userEmail,
					success: true,
				});
			} catch (emailError) {
				console.error(
					`Failed to send email to ${certificate.userEmail}:`,
					emailError
				);
				emailResults.push({
					userId: certificate.userId,
					userName: certificate.userName,
					email: certificate.userEmail,
					success: false,
					error:
						emailError instanceof Error ? emailError.message : 'Unknown error',
				});
			}
		}

		const successCount = emailResults.filter((r) => r.success).length;
		const failureCount = emailResults.filter((r) => !r.success).length;

		return {
			success: true,
			message: `Certificates distributed: ${successCount} successful, ${failureCount} failed`,
			results: emailResults,
			summary: {
				total: emailResults.length,
				successful: successCount,
				failed: failureCount,
			},
			event: result.event,
			template: result.template,
			role,
		};
	} catch (error) {
		console.error('Error distributing certificates:', error);
		throw error;
	}
}
