import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getEventById } from "@/lib/actions/event.action";
import {
  getEventImages,
  getEventImageTags,
} from "@/lib/actions/eventgallery.action";
import EventGalleryView from "@/components/shared/EventGalleryView";

interface EventGalleryViewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EventGalleryViewPage({
  params,
  searchParams,
}: EventGalleryViewPageProps) {
  await headers();
  const { id } = await params;
  const searchParamsResolved = await searchParams;

  try {
    // Get event
    const event = await getEventById(id);
    if (!event) {
      notFound();
    }

    // Parse filters from search params
    const filters = {
      search:
        typeof searchParamsResolved.search === "string"
          ? searchParamsResolved.search
          : "",
      tags:
        typeof searchParamsResolved.tags === "string"
          ? searchParamsResolved.tags.split(",").filter(Boolean)
          : [],
      sortBy: (searchParamsResolved.sortBy as "newest" | "oldest") || "newest",
      page:
        typeof searchParamsResolved.page === "string"
          ? parseInt(searchParamsResolved.page)
          : 1,
      limit: 20,
    };

    // Get images and available tags
    const [imagesData, availableTags] = await Promise.all([
      getEventImages({
        eventId: id,
        ...filters,
      }),
      getEventImageTags(id),
    ]);

    return (
      <div className="min-h-screen bg-background pt-16">
        {/* Header */}
        <section className="bg-red-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-bold mb-2">{event.title} - Gallery</h1>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <EventGalleryView
            event={event}
            imagesData={imagesData}
            availableTags={availableTags}
            filters={filters}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading event gallery:", error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const event = await getEventById(id);

    if (!event) {
      return {
        title: "Gallery Not Found",
      };
    }

    return {
      title: `${event.title} - Photo Gallery`,
      description: `Browse photos from ${event.title}`,
    };
  } catch (error) {
    return {
      title: "Gallery",
    };
  }
}
