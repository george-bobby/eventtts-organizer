'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Search,
	Grid3x3,
	List,
	Share2,
	Download,
	X,
	ChevronLeft,
	ChevronRight,
	Eye,
	Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialShareDropdown from '@/components/shared/SocialShareDropdown';

interface EventGalleryViewProps {
	event: any;
	imagesData: {
		images: any[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalCount: number;
			hasMore: boolean;
		};
	};
	availableTags: string[];
	filters: {
		search: string;
		tags: string[];
		sortBy: 'newest' | 'oldest';
		page: number;
	};
}

export default function EventGalleryView({
	event,
	imagesData,
	availableTags,
	filters,
}: EventGalleryViewProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();

	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedImage, setSelectedImage] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState(filters.search || '');
	const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

	const { images, pagination } = imagesData;

	// Update URL with new filters
	const updateFilters = (newFilters: Partial<typeof filters>) => {
		const params = new URLSearchParams(searchParams.toString());

		if (newFilters.search !== undefined) {
			if (newFilters.search) {
				params.set('search', newFilters.search);
			} else {
				params.delete('search');
			}
		}

		if (newFilters.tags !== undefined) {
			if (newFilters.tags.length > 0) {
				params.set('tags', newFilters.tags.join(','));
			} else {
				params.delete('tags');
			}
		}

		if (newFilters.sortBy) {
			params.set('sortBy', newFilters.sortBy);
		}

		if (newFilters.page) {
			params.set('page', newFilters.page.toString());
		}

		router.push(`?${params.toString()}`);
	};

	const handleSearch = () => {
		updateFilters({ search: searchTerm, page: 1 });
	};

	const toggleTag = (tag: string) => {
		const newTags = selectedTags.includes(tag)
			? selectedTags.filter((t) => t !== tag)
			: [...selectedTags, tag];
		setSelectedTags(newTags);
		updateFilters({ tags: newTags, page: 1 });
	};

	const handleSortChange = (sortBy: 'newest' | 'oldest') => {
		updateFilters({ sortBy, page: 1 });
	};

	const handlePageChange = (page: number) => {
		updateFilters({ page });
	};

	const handleImageClick = (image: any) => {
		setSelectedImage(image);
		// Increment view count
		fetch(`/api/event-gallery/${event._id}/images/${image._id}/view`, {
			method: 'POST',
		});
	};

	const handleDownload = async (image: any) => {
		try {
			const response = await fetch(image.fileUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = image.originalName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			// Increment download count
			fetch(`/api/event-gallery/${event._id}/images/${image._id}/download`, {
				method: 'POST',
			});

			toast({
				title: 'Download Started',
				description: 'Image is being downloaded',
			});
		} catch (error) {
			toast({
				title: 'Download Failed',
				description: 'Failed to download image',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Filters and Controls */}
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{/* Search and View Mode */}
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1 flex gap-2">
								<Input
									placeholder="Search images..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
									className="flex-1"
								/>
								<Button onClick={handleSearch}>
									<Search className="h-4 w-4" />
								</Button>
							</div>

							<div className="flex gap-2">
								<Select
									value={filters.sortBy}
									onValueChange={(value) =>
										handleSortChange(value as 'newest' | 'oldest')
									}
								>
									<SelectTrigger className="w-[150px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">Newest First</SelectItem>
										<SelectItem value="oldest">Oldest First</SelectItem>
									</SelectContent>
								</Select>

								<Button
									variant={viewMode === 'grid' ? 'default' : 'outline'}
									size="icon"
									onClick={() => setViewMode('grid')}
								>
									<Grid3x3 className="h-4 w-4" />
								</Button>
								<Button
									variant={viewMode === 'list' ? 'default' : 'outline'}
									size="icon"
									onClick={() => setViewMode('list')}
								>
									<List className="h-4 w-4" />
								</Button>
								<SocialShareDropdown
									shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
									title={event.name || 'Event Gallery'}
									description={event.description || `View photos from ${event.name}`}
									variant="outline"
								/>
							</div>
						</div>						{/* Tags Filter */}
						{availableTags.length > 0 && (
							<div className="flex flex-wrap gap-2">
								<span className="text-sm font-medium text-gray-700">Tags:</span>
								{availableTags.map((tag) => (
									<Badge
										key={tag}
										variant={selectedTags.includes(tag) ? 'default' : 'outline'}
										className="cursor-pointer"
										onClick={() => toggleTag(tag)}
									>
										{tag}
										{selectedTags.includes(tag) && (
											<X className="h-3 w-3 ml-1" />
										)}
									</Badge>
								))}
							</div>
						)}

						{/* Stats */}
						<div className="flex gap-4 text-sm text-gray-600">
							<span>{pagination.totalCount} images</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Images Grid/List */}
			{images.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<div className="text-6xl mb-4">📷</div>
						<h3 className="text-lg font-semibold mb-2">No Images Found</h3>
						<p className="text-gray-600 text-center">
							{filters.search || filters.tags.length > 0
								? 'Try adjusting your filters.'
								: 'Images will appear here once they are uploaded.'}
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					<div
						className={
							viewMode === 'grid'
								? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
								: 'space-y-4'
						}
					>
						{images.map((image) => (
							<Card
								key={image._id}
								className={`cursor-pointer hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex flex-row' : ''
									}`}
								onClick={() => handleImageClick(image)}
							>
								<div
									className={
										viewMode === 'list'
											? 'w-48 h-32 flex-shrink-0'
											: 'aspect-square'
									}
								>
									<img
										src={image.thumbnailUrl || image.fileUrl}
										alt={image.caption || image.originalName}
										className="w-full h-full object-cover rounded-t-lg"
									/>
								</div>
								{viewMode === 'list' && (
									<CardContent className="flex-1 p-4">
										<h4 className="font-medium mb-2">{image.originalName}</h4>
										{image.caption && (
											<p className="text-sm text-gray-600 mb-2">
												{image.caption}
											</p>
										)}
										{image.tags && image.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mb-2">
												{image.tags.map((tag: string) => (
													<Badge key={tag} variant="secondary" className="text-xs">
														{tag}
													</Badge>
												))}
											</div>
										)}
										<div className="flex gap-4 text-xs text-gray-500">
											<span className="flex items-center gap-1">
												<Eye className="h-3 w-3" />
												{image.viewCount}
											</span>
											<span className="flex items-center gap-1">
												<Download className="h-3 w-3" />
												{image.downloadCount}
											</span>
										</div>
									</CardContent>
								)}
							</Card>
						))}
					</div>

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className="flex justify-center gap-2">
							<Button
								variant="outline"
								disabled={pagination.currentPage === 1}
								onClick={() => handlePageChange(pagination.currentPage - 1)}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="flex items-center px-4">
								Page {pagination.currentPage} of {pagination.totalPages}
							</span>
							<Button
								variant="outline"
								disabled={!pagination.hasMore}
								onClick={() => handlePageChange(pagination.currentPage + 1)}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</>
			)}

			{/* Image Detail Dialog */}
			{selectedImage && (
				<Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle>{selectedImage.originalName}</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<img
								src={selectedImage.fileUrl}
								alt={selectedImage.caption || selectedImage.originalName}
								className="w-full h-auto rounded-lg"
							/>
							{selectedImage.caption && (
								<p className="text-gray-700">{selectedImage.caption}</p>
							)}
							{selectedImage.tags && selectedImage.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{selectedImage.tags.map((tag: string) => (
										<Badge key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							)}
							<div className="flex justify-between items-center">
								<div className="flex gap-4 text-sm text-gray-600">
									<span className="flex items-center gap-1">
										<Eye className="h-4 w-4" />
										{selectedImage.viewCount} views
									</span>
									<span className="flex items-center gap-1">
										<Download className="h-4 w-4" />
										{selectedImage.downloadCount} downloads
									</span>
								</div>
								<Button onClick={() => handleDownload(selectedImage)}>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

