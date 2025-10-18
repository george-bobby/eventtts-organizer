import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { headers } from 'next/headers';
import {
	uploadEventImages,
	getEventImages,
	getEventImageTags,
	getEventGalleryStats,
	deleteEventImage,
} from '@/lib/actions/eventgallery.action';
import { getUserByClerkId } from '@/lib/actions/user.action';

/**
 * GET /api/event-gallery/[eventId] - Get event images with filtering
 */
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ eventId: string }> }
) {
	await headers();
	const params = await context.params;
	try {
		const { searchParams } = new URL(request.url);

		const tags = searchParams.get('tags')?.split(',').filter(Boolean);
		const search = searchParams.get('search');
		const sortBy =
			(searchParams.get('sortBy') as 'newest' | 'oldest') || 'newest';
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const action = searchParams.get('action');

		// If action is 'tags', return available tags
		if (action === 'tags') {
			const availableTags = await getEventImageTags(params.eventId);
			return NextResponse.json({
				success: true,
				data: availableTags,
			});
		}

		// If action is 'stats', return gallery stats
		if (action === 'stats') {
			const stats = await getEventGalleryStats(params.eventId);
			return NextResponse.json({
				success: true,
				data: stats,
			});
		}

		// If action is 'list', return all images without pagination
		if (action === 'list') {
			const result = await getEventImages({
				eventId: params.eventId,
				sortBy: 'newest',
				page: 1,
				limit: 1000, // Get all images
			});
			return NextResponse.json({
				success: true,
				data: result.images,
			});
		}

		// Otherwise, return images with pagination
		const result = await getEventImages({
			eventId: params.eventId,
			tags,
			search: search || undefined,
			sortBy,
			page,
			limit,
		});

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error('Error getting event images:', error);
		return NextResponse.json(
			{
				error: 'Failed to get event images',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/event-gallery/[eventId] - Upload images to event gallery
 */
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ eventId: string }> }
) {
	await headers();
	const params = await context.params;
	try {
		console.log('🚀 POST /api/event-gallery/[eventId] - Starting image upload');

		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get MongoDB user ID from Clerk user ID
		console.log('🔍 DEBUG: Clerk userId:', userId);
		const mongoUser = await getUserByClerkId(userId);
		console.log('🔍 DEBUG: MongoDB user:', mongoUser);
		if (!mongoUser) {
			console.log('❌ DEBUG: User not found in MongoDB');
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}
		console.log('✅ DEBUG: Using mongoUser._id:', mongoUser._id);

		const body = await request.json();
		const { images } = body;

		if (!images || !Array.isArray(images) || images.length === 0) {
			return NextResponse.json(
				{ error: 'Images array is required' },
				{ status: 400 }
			);
		}

		// Validate image objects
		for (const image of images) {
			if (
				!image.fileName ||
				!image.originalName ||
				!image.fileUrl ||
				!image.fileSize ||
				!image.mimeType ||
				!image.dimensions
			) {
				return NextResponse.json(
					{ error: 'Invalid image object. Missing required fields.' },
					{ status: 400 }
				);
			}
		}

		console.log('📸 DEBUG: About to call uploadEventImages with:', {
			eventId: params.eventId,
			imagesCount: images.length,
			uploadedBy: mongoUser._id,
		});

		const uploadedImages = await uploadEventImages({
			eventId: params.eventId,
			images,
			uploadedBy: mongoUser._id.toString(),
		});

		return NextResponse.json({
			success: true,
			data: uploadedImages,
		});
	} catch (error) {
		console.error('Error uploading images:', error);
		return NextResponse.json(
			{
				error: 'Failed to upload images',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
/**
 * DELETE /api/event-gallery/[eventId] - Delete an image from event gallery
 */
export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ eventId: string }> }
) {
	await headers();
	const params = await context.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { imageId } = body;

		if (!imageId) {
			return NextResponse.json(
				{ error: 'Image ID is required' },
				{ status: 400 }
			);
		}

		await deleteEventImage(imageId);

		return NextResponse.json({
			success: true,
			message: 'Image deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting image:', error);
		return NextResponse.json(
			{
				error: 'Failed to delete image',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
