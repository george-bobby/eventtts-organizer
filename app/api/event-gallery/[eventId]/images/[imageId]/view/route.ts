import { NextRequest, NextResponse } from 'next/server';
import { incrementImageViewCount } from '@/lib/actions/eventgallery.action';

/**
 * POST /api/event-gallery/[eventId]/images/[imageId]/view - Increment view count
 */
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ eventId: string; imageId: string }> }
) {
	const params = await context.params;
	try {
		await incrementImageViewCount(params.imageId);

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error('Error incrementing view count:', error);
		return NextResponse.json(
			{
				error: 'Failed to increment view count',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

