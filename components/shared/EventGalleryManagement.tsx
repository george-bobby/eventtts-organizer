'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface EventGalleryManagementProps {
	eventId: string;
	eventTitle: string;
	organizerId: string;
}

interface GalleryImage {
	_id: string;
	fileName: string;
	originalName: string;
	fileUrl: string;
	fileId?: string;
	thumbnailUrl?: string;
	fileSize: number;
	tags: string[];
	caption?: string;
	uploadedAt: string;
	downloadCount: number;
	viewCount: number;
}

export default function EventGalleryManagement({
	eventId,
	eventTitle,
	organizerId,
}: EventGalleryManagementProps) {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState<string>('');
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [showTagSuggestions, setShowTagSuggestions] = useState(false);
	const [imageCaption, setImageCaption] = useState<string>('');
	const [existingImages, setExistingImages] = useState<GalleryImage[]>([]);
	const [isLoadingImages, setIsLoadingImages] = useState(false);
	const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
	const [isDeletingImage, setIsDeletingImage] = useState(false);
	const { toast } = useToast();
	const router = useRouter();
	const tagInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const tagsResponse = await fetch(
					`/api/event-gallery/${eventId}?action=tags`
				);
				if (tagsResponse.ok) {
					const tagsResult = await tagsResponse.json();
					setAvailableTags(tagsResult.data || []);
				}

				await fetchExistingImages();
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		fetchData();
	}, [eventId]);

	const fetchExistingImages = async () => {
		setIsLoadingImages(true);
		try {
			const response = await fetch(`/api/event-gallery/${eventId}?action=list`);
			if (response.ok) {
				const result = await response.json();
				setExistingImages(result.data || []);
			}
		} catch (error) {
			console.error('Error fetching images:', error);
		} finally {
			setIsLoadingImages(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			setSelectedFiles(files);
		}
	};

	const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTagInput(value);
		setShowTagSuggestions(value.length > 0);
	};

	const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && tagInput.trim()) {
			e.preventDefault();
			addTag(tagInput.trim());
		} else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
			setSelectedTags((prev) => prev.slice(0, -1));
		}
	};

	const addTag = (tag: string) => {
		if (!selectedTags.includes(tag)) {
			setSelectedTags((prev) => [...prev, tag]);
			if (!availableTags.includes(tag)) {
				setAvailableTags((prev) => [...prev, tag]);
			}
		}
		setTagInput('');
		setShowTagSuggestions(false);
		tagInputRef.current?.focus();
	};

	const removeTag = (tagToRemove: string) => {
		setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
	};

	const filteredSuggestions = availableTags.filter(
		(tag) =>
			tag.toLowerCase().includes(tagInput.toLowerCase()) &&
			!selectedTags.includes(tag)
	);

	const handleUpload = async () => {
		if (selectedFiles.length === 0) {
			toast({
				title: 'No Files Selected',
				description: 'Please select at least one image to upload',
				variant: 'destructive',
			});
			return;
		}

		try {
			setIsUploading(true);
			setUploadProgress(0);

			console.log('🚀 Starting upload for', selectedFiles.length, 'files');

			const uploadedImages = [];
			const totalFiles = selectedFiles.length;

			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				const formData = new FormData();
				formData.append('file', file);

				const uploadResponse = await fetch('/api/imagekit/upload-image', {
					method: 'POST',
					body: formData,
				});

				if (!uploadResponse.ok) {
					throw new Error(`Failed to upload ${file.name}`);
				}

				const uploadResult = await uploadResponse.json();
				uploadedImages.push({
					fileName: uploadResult.name,
					originalName: file.name,
					fileUrl: uploadResult.secure_url,
					fileId: uploadResult.fileId,
					fileSize: uploadResult.size || file.size,
					mimeType: file.type || 'image/jpeg',
					dimensions: {
						width: uploadResult.width || 800,
						height: uploadResult.height || 600,
					},
					tags: selectedTags,
					caption: imageCaption,
				});

				setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
			}

			console.log('✅ Files uploaded to ImageKit:', uploadedImages);

			const response = await fetch(`/api/event-gallery/${eventId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ images: uploadedImages }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save images');
			}

			const result = await response.json();
			console.log('✅ Images saved successfully:', result);

			toast({
				title: 'Upload Successful',
				description: `${uploadedImages.length} image(s) uploaded successfully`,
			});

			setSelectedFiles([]);
			setSelectedTags([]);
			setTagInput('');
			setImageCaption('');
			setUploadProgress(0);

			await fetchExistingImages();
			router.refresh();
		} catch (error) {
			console.error('❌ Error uploading images:', error);
			toast({
				title: 'Upload Failed',
				description:
					error instanceof Error ? error.message : 'Failed to upload images',
				variant: 'destructive',
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteImage = async (imageId: string) => {
		if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
			return;
		}

		setIsDeletingImage(true);
		try {
			const response = await fetch(`/api/event-gallery/${eventId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ imageId }),
			});

			if (!response.ok) {
				throw new Error('Failed to delete image');
			}

			toast({
				title: 'Image Deleted',
				description: 'Image has been successfully deleted',
			});

			await fetchExistingImages();
			setSelectedImage(null);
		} catch (error) {
			console.error('Error deleting image:', error);
			toast({
				title: 'Delete Failed',
				description: error instanceof Error ? error.message : 'Failed to delete image',
				variant: 'destructive',
			});
		} finally {
			setIsDeletingImage(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Upload Section */}
			<Card>
				<CardHeader>
					<CardTitle>Upload Images</CardTitle>
					<CardDescription>
						Upload images to the {eventTitle} gallery. Add tags to help organize and filter images.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Desktop Layout - 2 Column Grid */}
					<div className="hidden md:grid md:grid-cols-2 md:gap-4">
						{/* Select Images */}
						<div className="space-y-2">
							<Label htmlFor="file-upload">Select Images</Label>
							<Input
								id="file-upload"
								type="file"
								accept="image/*"
								multiple
								onChange={handleFileSelect}
								disabled={isUploading}
							/>
							{selectedFiles.length > 0 && (
								<p className="text-sm text-gray-500">
									{selectedFiles.length} file(s) selected
								</p>
							)}
						</div>

						{/* Tags */}
						<div className="space-y-2">
							<Label htmlFor="tags">Tags (optional)</Label>
							<div className="relative">
								<div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-white">
									{selectedTags.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="flex items-center gap-1"
										>
											{tag}
											<X
												className="h-3 w-3 cursor-pointer"
												onClick={() => removeTag(tag)}
											/>
										</Badge>
									))}
									<Input
										ref={tagInputRef}
										id="tags"
										placeholder={
											selectedTags.length === 0
												? 'Type and press Enter...'
												: 'Add more...'
										}
										value={tagInput}
										onChange={handleTagInputChange}
										onKeyDown={handleTagInputKeyDown}
										onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
										onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
										disabled={isUploading}
										className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto min-w-[150px]"
									/>
								</div>
								{showTagSuggestions && filteredSuggestions.length > 0 && (
									<div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
										{filteredSuggestions.map((tag) => (
											<div
												key={tag}
												className="px-3 py-2 cursor-pointer hover:bg-gray-100"
												onClick={() => addTag(tag)}
											>
												{tag}
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Caption */}
						<div className="space-y-2">
							<Label htmlFor="caption">Caption (optional)</Label>
							<Textarea
								id="caption"
								placeholder="Add a caption for these images"
								value={imageCaption}
								onChange={(e) => setImageCaption(e.target.value)}
								disabled={isUploading}
								rows={2}
							/>
						</div>

						{/* Upload Button */}
						<div className="flex items-end">
							<Button
								onClick={handleUpload}
								disabled={isUploading || selectedFiles.length === 0}
								className="w-full"
							>
								{isUploading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="h-4 w-4 mr-2" />
										Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
									</>
								)}
							</Button>
						</div>
					</div>

					{/* Mobile Layout - Stacked */}
					<div className="md:hidden space-y-4">
						{/* Select Images */}
						<div className="space-y-2">
							<Label htmlFor="file-upload-mobile">Select Images</Label>
							<Input
								id="file-upload-mobile"
								type="file"
								accept="image/*"
								multiple
								onChange={handleFileSelect}
								disabled={isUploading}
							/>
							{selectedFiles.length > 0 && (
								<p className="text-sm text-gray-500">
									{selectedFiles.length} file(s) selected
								</p>
							)}
						</div>

						{/* Tags */}
						<div className="space-y-2">
							<Label htmlFor="tags-mobile">Tags (optional)</Label>
							<div className="relative">
								<div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-white">
									{selectedTags.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="flex items-center gap-1"
										>
											{tag}
											<X
												className="h-3 w-3 cursor-pointer"
												onClick={() => removeTag(tag)}
											/>
										</Badge>
									))}
									<Input
										id="tags-mobile"
										placeholder={
											selectedTags.length === 0
												? 'Type and press Enter...'
												: 'Add more...'
										}
										value={tagInput}
										onChange={handleTagInputChange}
										onKeyDown={handleTagInputKeyDown}
										onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
										onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
										disabled={isUploading}
										className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto min-w-[150px]"
									/>
								</div>
							</div>
						</div>

						{/* Caption */}
						<div className="space-y-2">
							<Label htmlFor="caption-mobile">Caption (optional)</Label>
							<Textarea
								id="caption-mobile"
								placeholder="Add a caption for these images"
								value={imageCaption}
								onChange={(e) => setImageCaption(e.target.value)}
								disabled={isUploading}
								rows={2}
							/>
						</div>

						{/* Upload Button */}
						<Button
							onClick={handleUpload}
							disabled={isUploading || selectedFiles.length === 0}
							className="w-full"
						>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
								</>
							)}
						</Button>
					</div>

					{/* Upload Progress */}
					{isUploading && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Uploading...</span>
								<span>{uploadProgress}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-blue-600 h-2 rounded-full transition-all"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Gallery Section */}
			<Card>
				<CardHeader>
					<CardTitle>Gallery Images ({existingImages.length})</CardTitle>
					<CardDescription>
						View and manage images in the {eventTitle} gallery
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingImages ? (
						<div className="flex justify-center items-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
						</div>
					) : existingImages.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p>No images uploaded yet</p>
							<p className="text-sm mt-2">Upload your first image to get started</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{existingImages.map((image) => (
								<div
									key={image._id}
									className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
									onClick={() => setSelectedImage(image)}
								>
									<div className="aspect-square bg-gray-100 relative">
										<Image
											src={image.thumbnailUrl || image.fileUrl}
											alt={image.originalName}
											fill
											className="object-cover"
										/>
									</div>
									<div className="p-2">
										<p className="text-xs truncate font-medium">{image.originalName}</p>
										<div className="flex flex-wrap gap-1 mt-1">
											{image.tags.slice(0, 2).map((tag) => (
												<Badge key={tag} variant="secondary" className="text-xs">
													{tag}
												</Badge>
											))}
											{image.tags.length > 2 && (
												<Badge variant="secondary" className="text-xs">
													+{image.tags.length - 2}
												</Badge>
											)}
										</div>
									</div>
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
										<Button
											size="icon"
											variant="destructive"
											className="h-8 w-8"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteImage(image._id);
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Image Preview Dialog */}
			<Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>{selectedImage?.originalName}</DialogTitle>
						<DialogDescription>
							Uploaded on {selectedImage && new Date(selectedImage.uploadedAt).toLocaleDateString()}
						</DialogDescription>
					</DialogHeader>
					{selectedImage && (
						<div className="space-y-4">
							<div className="relative w-full h-96">
								<Image
									src={selectedImage.fileUrl}
									alt={selectedImage.originalName}
									fill
									className="object-contain"
								/>
							</div>
							{selectedImage.caption && (
								<div>
									<h4 className="font-semibold mb-1">Caption</h4>
									<p className="text-sm text-gray-600">{selectedImage.caption}</p>
								</div>
							)}
							{selectedImage.tags.length > 0 && (
								<div>
									<h4 className="font-semibold mb-2">Tags</h4>
									<div className="flex flex-wrap gap-2">
										{selectedImage.tags.map((tag) => (
											<Badge key={tag} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}
							<div className="flex gap-2">
								<Button
									variant="outline"
									onClick={() => window.open(selectedImage.fileUrl, '_blank')}
								>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
								<Button
									variant="destructive"
									onClick={() => handleDeleteImage(selectedImage._id)}
									disabled={isDeletingImage}
								>
									{isDeletingImage ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Deleting...
										</>
									) : (
										<>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete
										</>
									)}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

