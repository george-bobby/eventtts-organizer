import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/actions/user.action';
import { generateCertificatesForRole } from '@/lib/actions/certificate.action';
import JSZip from 'jszip';

/**
 * POST /api/certificates/generate - Generate certificates for download
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { templateId, eventId, role, action } = body;

		if (!templateId || !eventId || !role) {
			return NextResponse.json(
				{ error: 'Template ID, Event ID, and Role are required' },
				{ status: 400 }
			);
		}

		if (action === 'download') {
			// Handle ZIP download for role-based certificates
			const user = await getUserByClerkId(userId);
			if (!user) {
				return NextResponse.json({ error: 'User not found' }, { status: 404 });
			}

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
							`No users found with role: ${role}. No certificates to download.`,
					},
					{ status: 404 }
				);
			}

			// Create ZIP file
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
		} else {
			return NextResponse.json(
				{ error: 'Invalid action. Must be "download"' },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error('Error generating certificates:', error);
		return NextResponse.json(
			{
				error: 'Failed to generate certificates',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
