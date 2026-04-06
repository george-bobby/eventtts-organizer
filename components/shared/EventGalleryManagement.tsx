"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Loader2,
  X,
  Image as ImageIcon,
  Trash2,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
  const [tagInput, setTagInput] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [imageCaption, setImageCaption] = useState<string>("");
  const [existingImages, setExistingImages] = useState<GalleryImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const tagInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tagsResponse = await fetch(
          `/api/event-gallery/${eventId}?action=tags`,
        );
        if (tagsResponse.ok) {
          const tagsResult = await tagsResponse.json();
          setAvailableTags(tagsResult.data || []);
        }

        await fetchExistingImages();
      } catch (error) {
        console.error("Error fetching data:", error);
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
      console.error("Error fetching images:", error);
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
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    } else if (e.key === "Backspace" && !tagInput && selectedTags.length > 0) {
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
    setTagInput("");
    setShowTagSuggestions(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const filteredSuggestions = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag),
  );

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one image to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      console.log("🚀 Starting upload for", selectedFiles.length, "files");

      const uploadedImages = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/imagekit/upload-image", {
          method: "POST",
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
          mimeType: file.type || "image/jpeg",
          dimensions: {
            width: uploadResult.width || 800,
            height: uploadResult.height || 600,
          },
          tags: selectedTags,
          caption: imageCaption,
        });

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      console.log("✅ Files uploaded to ImageKit:", uploadedImages);

      const response = await fetch(`/api/event-gallery/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: uploadedImages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save images");
      }

      const result = await response.json();
      console.log("✅ Images saved successfully:", result);

      toast({
        title: "Upload Successful",
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      });

      setSelectedFiles([]);
      setSelectedTags([]);
      setTagInput("");
      setImageCaption("");
      setUploadProgress(0);

      await fetchExistingImages();
      router.refresh();
    } catch (error) {
      console.error("❌ Error uploading images:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this image? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeletingImage(true);
    try {
      const response = await fetch(`/api/event-gallery/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      toast({
        title: "Image Deleted",
        description: "Image has been successfully deleted",
      });

      await fetchExistingImages();
      setSelectedImage(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Upload Section - Left Side (40%) */}
      <div className="lg:w-[40%]">
        <Card className="border shadow-sm h-full">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-gray-700" />
              Upload Images
            </CardTitle>
            <CardDescription className="text-sm">
              Upload images to the {eventTitle} gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
									relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
									transition-all duration-200 hover:border-gray-400 hover:bg-gray-50
									${isDragging ? "border-gray-500 bg-gray-100" : "border-gray-300"}
									${isUploading ? "opacity-50 cursor-not-allowed" : ""}
								`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isDragging ? "Drop images here" : "Drag & drop or click"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Selected ({selectedFiles.length})
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                      disabled={isUploading}
                      className="h-7 text-xs text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative group border rounded overflow-hidden bg-gray-50"
                      >
                        <div className="aspect-square relative bg-gray-100">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="p-1 bg-white">
                          <p className="text-xs truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <div className="flex flex-wrap gap-1.5 p-2 border rounded min-h-[42px] bg-white focus-within:border-gray-400">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
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
                      placeholder="Type and press Enter..."
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                      onBlur={() =>
                        setTimeout(() => setShowTagSuggestions(false), 200)
                      }
                      disabled={isUploading}
                      className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto min-w-[120px] text-sm"
                    />
                  </div>
                  {showTagSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
                      {filteredSuggestions.map((tag) => (
                        <div
                          key={tag}
                          className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Caption Section */}
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-medium">
                  Caption{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  disabled={isUploading}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2 p-3 bg-gray-50 border rounded">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">Uploading...</span>
                    <span className="text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-800 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload{" "}
                    {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Section - Right Side (60%) */}
      <div className="lg:w-[60%]">
        <Card className="border shadow-sm h-full">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg">
              Gallery Images ({existingImages.length})
            </CardTitle>
            <CardDescription className="text-sm">
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
                <p className="text-sm mt-2">
                  Upload your first image to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {existingImages.map((image) => (
                  <div
                    key={image._id}
                    className="group relative border rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
                    <div className="p-2 bg-white">
                      <p className="text-xs truncate font-medium">
                        {image.originalName}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {image.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
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
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image._id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.originalName}</DialogTitle>
            <DialogDescription>
              Uploaded on{" "}
              {selectedImage &&
                new Date(selectedImage.uploadedAt).toLocaleDateString()}
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
                  <p className="text-sm text-gray-600">
                    {selectedImage.caption}
                  </p>
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
                  onClick={() => window.open(selectedImage.fileUrl, "_blank")}
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
