import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

/**
 * GET /api/imagekit/auth - Generate authentication parameters for client-side ImageKit uploads
 */
export async function GET() {
	try {
		// Initialize ImageKit with environment variables
		const imagekit = new ImageKit({
			publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
			privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
			urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
		});

		const authenticationParameters = imagekit.getAuthenticationParameters();

		return NextResponse.json(authenticationParameters);
	} catch (error) {
		console.error('Error generating ImageKit authentication parameters:', error);
		return NextResponse.json(
			{ message: 'Authentication failed' },
			{ status: 500 }
		);
	}
}

