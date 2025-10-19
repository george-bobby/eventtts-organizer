'use server';

import { connectToDatabase } from '../dbconnection';
import { CertificateTemplate, Certificate } from '../models/certificate.model';
import { Stakeholder } from '../models/stakeholder.model';
import Event from '../models/event.model';
import User from '../models/user.model';
import { revalidatePath } from 'next/cache';
import jsPDF from 'jspdf';
import {
	createDefaultTemplates,
	getDefaultTemplateByRole,
	generateDefaultCertificateContent,
} from './defaultTemplates.action';
import {
	CreateCertificateTemplateParams,
	GenerateCertificateParams,
	BulkGenerateCertificatesParams,
} from '../types/certificate.types';
import { getUserRoles } from './userrole.action';
import { getEventById } from './event.action';
import { getUserByClerkId } from './user.action';
import { Resend } from 'resend';
import { CERTIFICATE_TEMPLATES } from '../constants/certificate-templates';
import {
	generateCertificateHTML as generateNewCertificateHTML,
	getSampleCertificateData,
	getTemplateById,
	getColorSchemeById,
	CERTIFICATE_TEMPLATES_NEW,
	COLOR_OPTIONS,
} from '../constants/certificate-template-manager';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Create a new certificate template
 */
export async function createCertificateTemplate(
	params: CreateCertificateTemplateParams
) {
	try {
		await connectToDatabase();

		// Verify event exists and user has permission
		const event = await Event.findById(params.eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		const template = await CertificateTemplate.create({
			event: params.eventId,
			name: params.name,
			description: params.description,
			templateUrl: params.templateUrl,
			templateType: params.templateType,
			fields: params.fields,
			createdBy: params.createdBy,
		});

		revalidatePath(`/event/${params.eventId}/certificates`);
		return JSON.parse(JSON.stringify(template));
	} catch (error) {
		console.error('Error creating certificate template:', error);
		throw error;
	}
}

/**
 * Get certificate templates for an event (includes default templates)
 */
export async function getCertificateTemplates(
	eventId: string,
	userId?: string
) {
	try {
		await connectToDatabase();

		// Check if default templates exist, if not create them
		const existingDefaultTemplates = await CertificateTemplate.countDocuments({
			event: eventId,
			templateType: 'generated',
		});

		if (existingDefaultTemplates === 0 && userId) {
			await createDefaultTemplates(eventId, userId);
		}

		const templates = await CertificateTemplate.find({
			event: eventId,
			isActive: true,
		})
			.populate('createdBy', 'firstName lastName email')
			.sort({ templateType: 1, createdAt: -1 }); // Show generated templates first

		return JSON.parse(JSON.stringify(templates));
	} catch (error) {
		console.error('Error getting certificate templates:', error);
		throw error;
	}
}

/**
 * Get a specific certificate template
 */
export async function getCertificateTemplate(templateId: string) {
	try {
		await connectToDatabase();

		const template = await CertificateTemplate.findById(templateId)
			.populate('event', 'title description startDate endDate')
			.populate('createdBy', 'firstName lastName email');

		if (!template) {
			throw new Error('Certificate template not found');
		}

		return JSON.parse(JSON.stringify(template));
	} catch (error) {
		console.error('Error getting certificate template:', error);
		throw error;
	}
}

/**
 * Update certificate template
 */
export async function updateCertificateTemplate(
	templateId: string,
	updates: Partial<CreateCertificateTemplateParams>
) {
	try {
		await connectToDatabase();

		const template = await CertificateTemplate.findByIdAndUpdate(
			templateId,
			updates,
			{ new: true }
		);

		if (!template) {
			throw new Error('Certificate template not found');
		}

		revalidatePath(`/event/${template.event}/certificates`);
		return JSON.parse(JSON.stringify(template));
	} catch (error) {
		console.error('Error updating certificate template:', error);
		throw error;
	}
}

/**
 * Generate a single certificate
 */
export async function generateCertificate(params: GenerateCertificateParams) {
	try {
		await connectToDatabase();

		// Get template, stakeholder, event, and organizer
		const template = await CertificateTemplate.findById(
			params.templateId
		).populate('event');
		const stakeholder = await Stakeholder.findById(params.stakeholderId);
		const event = await Event.findById(template?.event._id);
		const organizer = await User.findById(event?.organizer);

		if (!template || !stakeholder || !event || !organizer) {
			throw new Error('Template, stakeholder, event, or organizer not found');
		}

		// Check if certificate already exists
		const existingCertificate = await Certificate.findOne({
			template: params.templateId,
			stakeholder: params.stakeholderId,
		});

		if (existingCertificate) {
			throw new Error('Certificate already exists for this stakeholder');
		}

		// Generate certificate PDF/image
		const certificateUrl = await generateCertificateFile(
			template,
			stakeholder,
			params.fieldValues,
			event,
			organizer
		);

		// Create certificate record
		const certificate = await Certificate.create({
			template: params.templateId,
			event: template.event._id,
			stakeholder: params.stakeholderId,
			certificateUrl,
			fieldValues: params.fieldValues,
		});

		// Update stakeholder
		await Stakeholder.findByIdAndUpdate(params.stakeholderId, {
			certificateGenerated: true,
			certificateId: certificate._id,
		});

		revalidatePath(`/event/${template.event._id}/certificates`);
		return JSON.parse(JSON.stringify(certificate));
	} catch (error) {
		console.error('Error generating certificate:', error);
		throw error;
	}
}

/**
 * Generate certificates in bulk
 */
export async function bulkGenerateCertificates(
	params: BulkGenerateCertificatesParams
) {
	try {
		await connectToDatabase();

		const template = await CertificateTemplate.findById(
			params.templateId
		).populate('event');
		if (!template) {
			throw new Error('Template not found');
		}

		// Get event and organizer
		const event = await Event.findById(template.event._id);
		const organizer = await User.findById(event?.organizer);

		if (!event || !organizer) {
			throw new Error('Event or organizer not found');
		}

		const stakeholders = await Stakeholder.find({
			_id: { $in: params.stakeholderIds },
			certificateGenerated: false,
		});

		const results = [];

		for (const stakeholder of stakeholders) {
			try {
				// Merge default field values with stakeholder-specific values
				const fieldValues = {
					...params.defaultFieldValues,
					participantName: stakeholder.name,
					participantEmail: stakeholder.email,
					participantRole: stakeholder.role,
					eventName: template.event.title,
					eventDate: template.event.startDate.toDateString(),
				};

				const certificateUrl = await generateCertificateFile(
					template,
					stakeholder,
					fieldValues,
					event,
					organizer
				);

				const certificate = await Certificate.create({
					template: params.templateId,
					event: template.event._id,
					stakeholder: stakeholder._id,
					certificateUrl,
					fieldValues,
				});

				await Stakeholder.findByIdAndUpdate(stakeholder._id, {
					certificateGenerated: true,
					certificateId: certificate._id,
				});

				results.push({
					stakeholderId: stakeholder._id,
					stakeholderName: stakeholder.name,
					success: true,
					certificateId: certificate._id,
				});
			} catch (error) {
				results.push({
					stakeholderId: stakeholder._id,
					stakeholderName: stakeholder.name,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}

		revalidatePath(`/event/${template.event._id}/certificates`);
		return results;
	} catch (error) {
		console.error('Error bulk generating certificates:', error);
		throw error;
	}
}

/**
 * Get certificates for an event
 */
export async function getEventCertificates(eventId: string) {
	try {
		await connectToDatabase();

		const certificates = await Certificate.find({ event: eventId })
			.populate('template', 'name templateType')
			.populate('stakeholder', 'name email role')
			.sort({ generatedAt: -1 });

		return JSON.parse(JSON.stringify(certificates));
	} catch (error) {
		console.error('Error getting event certificates:', error);
		throw error;
	}
}

/**
 * Helper function to generate certificate file
 */
async function generateCertificateFile(
	template: any,
	stakeholder: any,
	fieldValues: { [key: string]: string },
	event: any,
	organizer: any
): Promise<string> {
	try {
		if (template.templateType === 'generated') {
			// Generate HTML certificate for default templates
			const htmlContent = await generateDefaultCertificateContent(
				template,
				stakeholder,
				event,
				organizer
			);

			// In a real implementation, you would convert HTML to PDF
			// For now, we'll store the HTML content and return a URL
			// You could use libraries like puppeteer or html-pdf for PDF generation

			// Placeholder URL - in production, upload the generated PDF to storage
			return `https://certificates.example.com/generated/${template._id}/${stakeholder._id}.pdf`;
		} else {
			// Handle uploaded template files
			// 1. Load the template file
			// 2. Apply the field values at specified coordinates
			// 3. Generate a new PDF/image file
			// 4. Upload to storage and return URL

			// For now, return a placeholder URL
			return `https://certificates.example.com/${template._id}/${stakeholder._id}.pdf`;
		}
	} catch (error) {
		console.error('Error generating certificate file:', error);
		throw error;
	}
}

/**
 * Delete certificate template
 */
export async function deleteCertificateTemplate(templateId: string) {
	try {
		await connectToDatabase();

		const template = await CertificateTemplate.findByIdAndUpdate(
			templateId,
			{ isActive: false },
			{ new: true }
		);

		if (!template) {
			throw new Error('Certificate template not found');
		}

		revalidatePath(`/event/${template.event}/certificates`);
		return { success: true };
	} catch (error) {
		console.error('Error deleting certificate template:', error);
		throw error;
	}
}

/**
 * Auto-generate certificates for stakeholders based on their role
 */
export async function autoGenerateCertificates(
	eventId: string,
	userId: string
) {
	try {
		await connectToDatabase();

		// Ensure default templates exist
		await getCertificateTemplates(eventId, userId);

		// Get all stakeholders who attended the event
		const stakeholders = await Stakeholder.find({
			event: eventId,
			attendanceStatus: 'attended',
			certificateGenerated: false,
		});

		const results = [];

		for (const stakeholder of stakeholders) {
			try {
				// Find appropriate template based on role
				const template = await CertificateTemplate.findOne({
					event: eventId,
					templateType: 'generated',
					name: {
						$regex: new RegExp(stakeholder.role, 'i'),
					},
				});

				// Fallback to participation certificate if no role-specific template found
				const fallbackTemplate = await CertificateTemplate.findOne({
					event: eventId,
					templateType: 'generated',
					name: 'Participation Certificate',
				});

				const selectedTemplate = template || fallbackTemplate;

				if (!selectedTemplate) {
					results.push({
						stakeholder: stakeholder._id,
						success: false,
						error: 'No suitable template found',
					});
					continue;
				}

				// Generate default field values
				const fieldValues = {
					participantName: stakeholder.name,
					participantRole: stakeholder.role,
					eventName: '',
					eventDate: '',
					organizerSignature: '',
				};

				// Generate certificate
				const certificate = await generateCertificate({
					templateId: selectedTemplate._id.toString(),
					stakeholderId: stakeholder._id.toString(),
					fieldValues,
				});

				results.push({
					stakeholder: stakeholder._id,
					certificate: certificate._id,
					success: true,
				});
			} catch (error) {
				results.push({
					stakeholder: stakeholder._id,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}

		revalidatePath(`/event/${eventId}/certificates`);
		return results;
	} catch (error) {
		console.error('Error auto-generating certificates:', error);
		throw error;
	}
}

export async function generateCertificateHTML(
	template: (typeof CERTIFICATE_TEMPLATES)[0],
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
				template:
					CERTIFICATE_TEMPLATES.find((t) => t.id === templateId)?.name ||
					'Unknown Template',
				role,
				message: `No users found with role: ${role}. No certificates generated.`,
			};
		}

		// Get template
		const template = CERTIFICATE_TEMPLATES.find((t) => t.id === templateId);
		if (!template) {
			throw new Error('Template not found');
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
