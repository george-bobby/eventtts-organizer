import { lazy, Suspense } from "react";
import EventsHero from "@/components/shared/EventsHero";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getEvents } from "@/lib/actions/event.action";
import RecentEventsSection from "@/components/shared/RecentEventsSection";

const FeaturesSection = lazy(
  () => import("@/components/shared/FeaturesSection"),
);
const VideoSection = lazy(() => import("@/components/shared/VideoSection"));
const CTASections = lazy(() => import("@/components/shared/CTASections"));

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentResult = await getEvents({ limit: 3 });
  const recentEvents = recentResult?.events || [];

  return (
    <>
      <EventsHero />

      <RecentEventsSection events={recentEvents} />

      <Suspense fallback={<LoadingSpinner className="py-24 bg-background" />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner className="py-24 bg-background" />}>
        <VideoSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner className="py-24 bg-background" />}>
        <CTASections />
      </Suspense>
    </>
  );
}
