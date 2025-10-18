import { NextRequest, NextResponse } from 'next/server';
import { incrementImageDownloadCount } from '@/lib/actions/eventgallery.action';

/**
 * POST /api/event-gallery/[eventId]/images/[imageId]/download - Increment download count
 */
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ eventId: string; imageId: string }> }
) {
	const params = await context.params;
	try {
		await incrementImageDownloadCount(params.imageId);

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error('Error incrementing download count:', error);
		return NextResponse.json(
			{
				error: 'Failed to increment download count',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

