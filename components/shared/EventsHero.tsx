"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const heroImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80",
];

function CrossfadeImage({
  activeIndex,
  className,
}: {
  activeIndex: number;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {heroImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={i !== activeIndex}
          className="absolute inset-0 h-full w-full object-cover transition-\\[opacity,transform\\] duration-\\[900ms\\] ease-\\[cubic-bezier(0.4,0,0.2,1)\\]"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            transform: i === activeIndex ? "scale(1)" : "scale(1.04)",
          }}
        />
      ))}
    </div>
  );
}

export default function EventsHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background pt-[4.5rem] pb-12 lg:pb-16">
      {/* Subtle grid lines */}
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden opacity-[0.04]">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left — text content */}
          <div className="flex flex-col justify-center pt-2 lg:pt-0">
            <div
              className={`mb-6 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
            >
              <span className="inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span className="h-px w-8 bg-border" />
                Professional Event Organization
              </span>
            </div>

            <h1
              className={`mb-8 text-[clamp(2.8rem,5.5vw,6.5rem)] font-display leading-[0.92] tracking-tight text-foreground transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
            >
              <span className="block">Organize &</span>
              <span className="block">Manage</span>
              <span className="block text-muted-foreground">Your Events.</span>
            </h1>

            <p
              className={`mb-10 max-w-lg text-xl leading-relaxed text-muted-foreground transition-all delay-200 duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
            >
              Everything you need to organize successful events — from planning
              to execution, attendee management to analytics.
            </p>

            <div
              className={`flex flex-col items-start gap-4 transition-all delay-300 duration-1000 sm:flex-row ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
            >
              <Link href="/create">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90"
                >
                  Create New Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-foreground/20 bg-transparent px-8 text-base text-foreground hover:bg-muted"
                >
                  Manage My Events
                </Button>
              </Link>
            </div>

            <div
              className={`mt-12 flex gap-10 border-t border-border pt-8 transition-all delay-500 duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
            >
              {[
                { value: "1,250+", label: "Events" },
                { value: "15K+", label: "Attendees" },
                { value: "75+", label: "Campuses" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl text-foreground">
                    {s.value}
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image mosaic */}
          <div
            className={`relative hidden lg:grid h-[520px] grid-cols-2 grid-rows-2 gap-3 transition-all delay-400 duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
              }`}
          >
            <div className="relative col-span-1 row-span-2 overflow-hidden rounded-2xl border border-border">
              <CrossfadeImage activeIndex={activeImage} className="h-full w-full" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border">
              <CrossfadeImage
                activeIndex={(activeImage + 1) % heroImages.length}
                className="h-full min-h-[200px] w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border">
              <CrossfadeImage
                activeIndex={(activeImage + 2) % heroImages.length}
                className="h-full min-h-[200px] w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5">
                <div className="font-display text-3xl text-white">4.9/5</div>
                <div className="mt-1 font-mono text-xs uppercase tracking-wider text-white/70">
                  Avg. Rating
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === activeImage
                    ? "w-4 bg-foreground"
                    : "w-1.5 bg-foreground/30"
                    }`}
                  aria-label={`Show image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
