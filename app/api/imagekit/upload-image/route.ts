import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { headers } from 'next/headers';
import ImageKit from 'imagekit';

/**
 * POST /api/imagekit/upload-image - Server-side image upload to ImageKit
 */
export async function POST(request: NextRequest) {
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

		// Get form data
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json(
				{ message: 'No image file provided' },
				{ status: 400 }
			);
		}

		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Upload to ImageKit
		const result = await imagekit.upload({
			file: buffer,
			fileName: file.name || `image_${Date.now()}`,
			folder: '/eventtts',
		});

		return NextResponse.json({
			secure_url: result.url,
			fileId: result.fileId,
			name: result.name,
			width: result.width,
			height: result.height,
			size: result.size,
		});
	} catch (error) {
		console.error('Error uploading image to ImageKit:', error);
		return NextResponse.json(
			{ message: 'Image upload failed' },
			{ status: 500 }
		);
	}
}

