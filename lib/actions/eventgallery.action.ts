'use server';

import { connectToDatabase } from '../dbconnection';
import EventGalleryImage from '../models/eventgallery.model';
import Event from '../models/event.model';
import { revalidatePath } from 'next/cache';

export interface UploadEventImagesParams {
	eventId: string;
	images: {
		fileName: string;
		originalName: string;
		fileUrl: string;
		fileId?: string;
		fileSize: number;
		mimeType: string;
		dimensions: { width: number; height: number };
		tags?: string[];
		caption?: string;
	}[];
	uploadedBy: string;
}

export interface GetEventImagesParams {
	eventId: string;
	tags?: string[];
	search?: string;
	sortBy?: 'newest' | 'oldest';
	page?: number;
	limit?: number;
}

/**
 * Upload images directly to an event gallery (no folders)
 */
export async function uploadEventImages(params: UploadEventImagesParams) {
	try {
		console.log('📸 uploadEventImages called with:', {
			eventId: params.eventId,
			imagesCount: params.images.length,
			uploadedBy: params.uploadedBy,
		});

		await connectToDatabase();

		// Verify event exists
		const event = await Event.findById(params.eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		// Create image documents
		const imageDocuments = params.images.map((image) => ({
			event: params.eventId,
			fileName: image.fileName,
			originalName: image.originalName,
			fileUrl: image.fileUrl,
			fileId: image.fileId,
			fileSize: image.fileSize,
			mimeType: image.mimeType,
			dimensions: image.dimensions,
			tags: image.tags || [],
			caption: image.caption || '',
			visibility: 'public',
			uploadedBy: params.uploadedBy,
			uploadedAt: new Date(),
		}));

		const uploadedImages = await EventGalleryImage.insertMany(imageDocuments);

		console.log('✅ Successfully uploaded', uploadedImages.length, 'images');

		revalidatePath(`/event/${params.eventId}/gallery/view`);

		return JSON.parse(JSON.stringify(uploadedImages));
	} catch (error) {
		console.error('Error uploading event images:', error);
		throw error;
	}
}

/**
 * Get images for an event with filtering and sorting
 */
export async function getEventImages(params: GetEventImagesParams) {
	try {
		await connectToDatabase();

		const {
			eventId,
			tags,
			search,
			sortBy = 'newest',
			page = 1,
			limit = 20,
		} = params;

		// Build query
		const query: any = {
			event: eventId,
			visibility: 'public',
		};

		// Filter by tags if provided
		if (tags && tags.length > 0) {
			query.tags = { $in: tags };
		}

		// Search in caption and originalName
		if (search) {
			query.$or = [
				{ caption: { $regex: search, $options: 'i' } },
				{ originalName: { $regex: search, $options: 'i' } },
			];
		}

		// Calculate pagination
		const skip = (page - 1) * limit;

		// Sort order
		const sort: any =
			sortBy === 'newest' ? { uploadedAt: -1 } : { uploadedAt: 1 };

		// Execute query
		const [images, totalCount] = await Promise.all([
			EventGalleryImage.find(query)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.populate('uploadedBy', 'firstName lastName username photo')
				.lean(),
			EventGalleryImage.countDocuments(query),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		return {
			images: JSON.parse(JSON.stringify(images)),
			pagination: {
				currentPage: page,
				totalPages,
				totalCount,
				hasMore: page < totalPages,
			},
		};
	} catch (error) {
		console.error('Error getting event images:', error);
		throw error;
	}
}

/**
 * Get all unique tags for an event
 */
export async function getEventImageTags(eventId: string) {
	try {
		await connectToDatabase();

		const tags = await EventGalleryImage.distinct('tags', {
			event: eventId,
			visibility: 'public',
		});

		return tags.filter((tag) => tag && tag.trim() !== '');
	} catch (error) {
		console.error('Error getting event image tags:', error);
		throw error;
	}
}

/**
 * Get event gallery stats
 */
export async function getEventGalleryStats(eventId: string) {
	try {
		await connectToDatabase();

		const [totalImages, totalViews, totalDownloads] = await Promise.all([
			EventGalleryImage.countDocuments({
				event: eventId,
				visibility: 'public',
			}),
			EventGalleryImage.aggregate([
				{ $match: { event: eventId, visibility: 'public' } },
				{ $group: { _id: null, total: { $sum: '$viewCount' } } },
			]),
			EventGalleryImage.aggregate([
				{ $match: { event: eventId, visibility: 'public' } },
				{ $group: { _id: null, total: { $sum: '$downloadCount' } } },
			]),
		]);

		return {
			totalImages,
			totalViews: totalViews[0]?.total || 0,
			totalDownloads: totalDownloads[0]?.total || 0,
		};
	} catch (error) {
		console.error('Error getting event gallery stats:', error);
		throw error;
	}
}

/**
 * Update image metadata (tags, caption)
 */
export async function updateEventImage(
	imageId: string,
	updates: { tags?: string[]; caption?: string }
) {
	try {
		await connectToDatabase();

		const image = await EventGalleryImage.findByIdAndUpdate(
			imageId,
			{ $set: updates },
			{ new: true }
		);

		if (!image) {
			throw new Error('Image not found');
		}

		revalidatePath(`/event/${image.event}/gallery/view`);

		return JSON.parse(JSON.stringify(image));
	} catch (error) {
		console.error('Error updating event image:', error);
		throw error;
	}
}

/**
 * Delete an image from MongoDB and ImageKit
 */
export async function deleteEventImage(imageId: string) {
	try {
		await connectToDatabase();

		const image = await EventGalleryImage.findById(imageId);

		if (!image) {
			throw new Error('Image not found');
		}

		// Delete from ImageKit if fileId exists
		if (image.fileId) {
			try {
				const response = await fetch(
					`${
						process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
					}/api/imagekit/delete-image`,
					{
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ fileId: image.fileId }),
					}
				);

				if (!response.ok) {
					console.error('Failed to delete image from ImageKit');
				}
			} catch (error) {
				console.error('Error deleting from ImageKit:', error);
			}
		}

		// Delete from MongoDB
		await EventGalleryImage.findByIdAndDelete(imageId);

		revalidatePath(`/event/${image.event}/gallery/view`);

		return { success: true };
	} catch (error) {
		console.error('Error deleting event image:', error);
		throw error;
	}
}

/**
 * Increment view count
 */
export async function incrementImageViewCount(imageId: string) {
	try {
		await connectToDatabase();

		await EventGalleryImage.findByIdAndUpdate(imageId, {
			$inc: { viewCount: 1 },
		});

		return { success: true };
	} catch (error) {
		console.error('Error incrementing view count:', error);
		throw error;
	}
}

/**
 * Increment download count
 */
export async function incrementImageDownloadCount(imageId: string) {
	try {
		await connectToDatabase();

		await EventGalleryImage.findByIdAndUpdate(imageId, {
			$inc: { downloadCount: 1 },
		});

		return { success: true };
	} catch (error) {
		console.error('Error incrementing download count:', error);
		throw error;
	}
}
