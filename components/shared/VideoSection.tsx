"use client";

import { Play, Users, Calendar, Trophy } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const DEMO_VIDEO_ID = process.env.NEXT_PUBLIC_DEMO_VIDEO_ID;

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const posterSrc = posterFailed
    ? `https://img.youtube.com/vi/${DEMO_VIDEO_ID}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${DEMO_VIDEO_ID}/maxresdefault.jpg`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  const features = [
    {
      icon: Users,
      title: "Community Building",
      desc: "Connect with thousands of students and build lasting relationships through shared interests and events.",
    },
    {
      icon: Calendar,
      title: "Event Discovery",
      desc: "Find and attend events that match your passions, from academic workshops to social gatherings.",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      desc: "Earn badges and recognition for your campus involvement and help others discover great events.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background pt-24 pb-10 lg:pt-32 lg:pb-12"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="relative mb-16 lg:mb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-12 h-px bg-foreground/30" />
                Showcase
              </span>
              <h2
                className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
                  }`}
              >
                See it in
                <br />
                <span className="text-muted-foreground">action.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p
                className={`text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                  }`}
              >
                Watch how students are transforming their campus experience and
                creating unforgettable memories through our events platform.
              </p>
            </div>
          </div>
        </div>

        <div
          className={`relative rounded-3xl border border-border overflow-hidden bg-black transition-all duration-1000 delay-300 mb-4 lg:mb-6 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
          {!isPlaying ? (
            <button
              type="button"
              className="relative aspect-video w-full cursor-pointer group text-left"
              onClick={handlePlayVideo}
              aria-label="Play platform demo video"
            >
              {/* YouTube poster */}
              <Image
                src={posterSrc}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 1400px) 100vw, 1400px"
                priority={false}
                onError={() => setPosterFailed(true)}
              />

              {/* Cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

              {/* Play control */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="flex h-20 w-20 md:h-28 md:w-28 items-center justify-center rounded-full bg-white/95 text-black shadow-2xl ring-2 ring-white/40 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white">
                  <Play
                    className="ml-1 h-9 w-9 md:h-11 md:w-11"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              </div>

              {/* Copy — light on dark */}
              <div className="absolute inset-0 z-[5] flex items-end p-6 md:p-10 lg:p-12 pointer-events-none">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-white mb-2 drop-shadow-sm">
                    Platform Demo &amp; Success Stories
                  </h3>
                  <p className="text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
                    Discover how students are using our platform to create
                    amazing campus experiences.
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="aspect-video w-full bg-black">
              <iframe
                width="100%"
                height="100%"
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1`}
                title="Events Platform Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`relative bg-muted/40 border border-border p-8 lg:p-12 overflow-hidden group transition-all duration-700 delay-500 ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
                }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-display text-foreground mb-4 group-hover:translate-x-2 transition-transform duration-500">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
