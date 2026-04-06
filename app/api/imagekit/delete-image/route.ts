import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import ImageKit from 'imagekit';

/**
 * DELETE /api/imagekit/delete-image - Delete an image from ImageKit
 */
export async function DELETE(request: NextRequest) {
	await headers();

	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Initialize ImageKit
		const imagekit = new ImageKit({
			publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
			privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
			urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
		});

		// Get fileId from request body
		const body = await request.json();
		const { fileId } = body;

		if (!fileId) {
			return NextResponse.json(
				{ message: 'File ID is required' },
				{ status: 400 }
			);
		}

		// Delete from ImageKit
		await imagekit.deleteFile(fileId);

		return NextResponse.json({
			success: true,
			message: 'Image deleted from ImageKit successfully',
		});
	} catch (error) {
		console.error('Error deleting image from ImageKit:', error);
		return NextResponse.json(
			{ message: 'Image deletion failed' },
			{ status: 500 }
		);
	}
}

