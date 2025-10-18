import { Schema, model, models, Document } from 'mongoose';

// Simplified gallery image interface - no folders, just images with tags
export interface IEventGalleryImage extends Document {
	_id: string;
	event: Schema.Types.ObjectId;
	fileName: string;
	originalName: string;
	fileUrl: string;
	fileId?: string; // ImageKit fileId for deletion
	thumbnailUrl?: string;
	fileSize: number;
	mimeType: string;
	dimensions: {
		width: number;
		height: number;
	};
	tags: string[]; // Simple array of tags for filtering
	caption?: string;
	visibility: 'public' | 'private';
	downloadCount: number;
	viewCount: number;
	uploadedBy: Schema.Types.ObjectId;
	uploadedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Simplified Event Gallery Image Schema
const eventGalleryImageSchema = new Schema<IEventGalleryImage>(
	{
		event: {
			type: Schema.Types.ObjectId,
			ref: 'Event',
			required: true,
			index: true,
		},
		fileName: {
			type: String,
			required: true,
		},
		originalName: {
			type: String,
			required: true,
		},
		fileUrl: {
			type: String,
			required: true,
		},
		fileId: {
			type: String,
		},
		thumbnailUrl: {
			type: String,
		},
		fileSize: {
			type: Number,
			required: true,
		},
		mimeType: {
			type: String,
			required: true,
		},
		dimensions: {
			width: { type: Number, required: true },
			height: { type: Number, required: true },
		},
		tags: {
			type: [String],
			default: [],
		},
		caption: {
			type: String,
			trim: true,
		},
		visibility: {
			type: String,
			enum: ['public', 'private'],
			default: 'public',
		},
		downloadCount: {
			type: Number,
			default: 0,
		},
		viewCount: {
			type: Number,
			default: 0,
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		uploadedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for better performance
eventGalleryImageSchema.index({ event: 1, visibility: 1 });
eventGalleryImageSchema.index({ event: 1, uploadedAt: -1 });
eventGalleryImageSchema.index({ tags: 1 });

export const EventGalleryImage =
	models.EventGalleryImage ||
	model<IEventGalleryImage>('EventGalleryImage', eventGalleryImageSchema);

export default EventGalleryImage;
