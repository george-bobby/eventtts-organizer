import Image from "next/image";
import Link from "next/link";
import { EventWithSubEvents } from "@/lib/actions/event.action";
import { dateConverter } from "@/lib/utils";
import { ArrowUpRight, MapPin, Clock } from "lucide-react";

interface Props {
  events: EventWithSubEvents[];
}

export default function RecentEventsSection({ events }: Props) {
  if (!events || events.length === 0) return null;

  const [featured, ...rest] = events;

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="relative mb-16 lg:mb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-12 h-px bg-foreground/30" />
                Latest
              </span>
              <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]">
                Fresh
                <br />
                <span className="text-muted-foreground">events.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4 flex flex-col gap-6">
              <p className="text-xl text-muted-foreground leading-relaxed">
                The latest events happening across campuses — discover,
                register, and show up.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-foreground border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-300 self-start"
              >
                Browse all events
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Featured — large card */}
          <Link
            href={`/event/${featured._id}`}
            className="lg:col-span-2 relative bg-muted/40 border border-border overflow-hidden group min-h-[480px] flex flex-col"
          >
            {featured.photo ? (
              <div className="relative flex-1 overflow-hidden min-h-[280px]">
                <Image
                  src={featured.photo}
                  alt={featured.title}
                  fill
                  className="object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </div>
            ) : (
              <div className="flex-1 bg-muted/60 min-h-[280px]" />
            )}
            <div className="relative p-8 lg:p-12 flex flex-col gap-4 -mt-20 z-10">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground border border-border px-3 py-1">
                  {(featured.category as any)?.name || "Event"}
                </span>
                {featured.isFree ? (
                  <span className="text-xs font-mono uppercase tracking-wider text-foreground border border-foreground/40 px-3 py-1">
                    Free
                  </span>
                ) : (
                  <span className="text-xs font-mono uppercase tracking-wider text-foreground border border-foreground/40 px-3 py-1">
                    ₹{featured.price}
                  </span>
                )}
              </div>
              <h3 className="text-3xl lg:text-4xl font-display text-foreground leading-tight group-hover:translate-x-2 transition-transform duration-500 line-clamp-2">
                {featured.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                {featured.description}
              </p>
              <div className="flex flex-wrap gap-6 mt-2 text-sm text-muted-foreground font-mono">
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {dateConverter(featured.startDate as unknown as string)}
                </span>
                {(featured.landmark || featured.location) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {featured.landmark || featured.location}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="w-4 h-4 text-foreground" />
            </div>
          </Link>

          {/* Right column — smaller cards */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {rest.slice(0, 2).map((event, i) => (
              <Link
                key={String(event._id)}
                href={`/event/${event._id}`}
                className="relative bg-muted/40 border border-border overflow-hidden group flex flex-col flex-1 min-h-[220px]"
              >
                {event.photo && (
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={event.photo}
                      alt={event.title}
                      fill
                      className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  </div>
                )}
                <div className="p-6 lg:p-8 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {(event.category as any)?.name || "Event"}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {dateConverter(event.startDate as unknown as string)}
                    </span>
                  </div>
                  <h3 className="text-xl font-display text-foreground leading-tight group-hover:translate-x-2 transition-transform duration-500 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-auto">
                    {event.description}
                  </p>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-3 h-3 text-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
