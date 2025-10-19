import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '@/lib/actions/user.action';
import { generateCertificatesForRole } from '@/lib/actions/certificate.action';
import JSZip from 'jszip';

/**
 * POST /api/certificates/generate-advanced - Generate certificates with new template system
 * This endpoint generates HTML certificates using the new template system
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const {
			eventId,
			role,
			templateId,
			format = 'pdf', // pdf, png, jpeg
			action = 'download', // download, preview
			quality = 0.95,
		} = body;

		if (!eventId || !role || !templateId) {
			return NextResponse.json(
				{ error: 'Event ID, role, and template ID are required' },
				{ status: 400 }
			);
		}

		// Get user
		const user = await getUserByClerkId(userId);
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Generate certificates
		const result = await generateCertificatesForRole(
			eventId,
			role,
			templateId,
			user._id.toString()
		);

		// Check if any certificates were generated
		if (result.certificates.length === 0) {
			return NextResponse.json(
				{
					error:
						result.message ||
						`No users found with role: ${role}. No certificates to generate.`,
				},
				{ status: 404 }
			);
		}

		if (action === 'preview') {
			// Return just the HTML for preview
			return NextResponse.json({
				success: true,
				data: {
					certificates: result.certificates.map((cert) => ({
						html: cert.html,
						filename: cert.filename,
						userName: cert.userName,
					})),
					count: result.certificates.length,
				},
			});
		}

		// For now, return HTML files in ZIP format
		// Client-side will handle conversion to PDF/images using html2canvas
		const zip = new JSZip();

		for (const certificate of result.certificates) {
			zip.file(certificate.filename, certificate.html);
		}

		const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

		return new NextResponse(zipBuffer as ArrayBuffer, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${role}_certificates.zip"`,
			},
		});
	} catch (error) {
		console.error('Error generating advanced certificates:', error);
		return NextResponse.json(
			{
				error: 'Failed to generate certificates',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

/**
 * GET /api/certificates/generate-advanced - Get supported formats and options
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({
			success: true,
			data: {
				supportedFormats: ['pdf', 'png', 'jpeg'],
				defaultFormat: 'pdf',
				qualityRange: { min: 0.1, max: 1.0, default: 0.95 },
				actions: ['download', 'preview'],
			},
		});
	} catch (error) {
		console.error('Error getting advanced certificate options:', error);
		return NextResponse.json(
			{
				error: 'Failed to get certificate options',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
