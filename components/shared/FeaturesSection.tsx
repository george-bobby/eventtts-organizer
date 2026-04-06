"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "AI-Powered Analytics",
    description:
      "Get intelligent insights about your events with automated reports on attendance, engagement, and revenue performance.",
    stats: { value: "100%", label: "automated" },
  },
  {
    number: "02",
    title: "QR Code Tickets",
    description:
      "Generate secure QR code tickets for instant check-in. Each ticket has a unique entry code — scan or type, verified in under a second.",
    stats: { value: "<1s", label: "scan time" },
  },
  {
    number: "03",
    title: "Attendee & Role Management",
    description:
      "Assign volunteers, speakers, and participants with granular permissions. Manage the full roster from a single dashboard.",
    stats: { value: "360°", label: "visibility" },
  },
  {
    number: "04",
    title: "AI Event Planning",
    description:
      "An AI-powered task board that auto-generates a step-by-step plan for your event — from setup to post-event follow-up.",
    stats: { value: "GPT-5.4", label: "powered" },
  },
  {
    number: "05",
    title: "Auto Feedback Collection",
    description:
      "Automatically send feedback forms after your event ends. Collect structured responses and view AI-summarised insights.",
    stats: { value: "24/7", label: "collection" },
  },
  {
    number: "06",
    title: "Photo Gallery",
    description:
      "Upload and manage event photos in a beautiful gallery. Volunteers and speakers can contribute images too.",
    stats: { value: "∞", label: "uploads" },
  },
  {
    number: "07",
    title: "Certificate Generation",
    description:
      "Create and distribute branded digital certificates to participants, speakers, and volunteers in one click.",
    stats: { value: "1-click", label: "distribute" },
  },
  {
    number: "08",
    title: "Event Notifications",
    description:
      "Send targeted updates and announcements to all attendees directly from your event dashboard — instantly.",
    stats: { value: "instant", label: "delivery" },
  },
];

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Full width with diagonal layout */}
        <div className="relative mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-12 h-px bg-foreground/30" />
                Capabilities
              </span>
              <h2
                className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
                  }`}
              >
                Powerful
                <br />
                <span className="text-muted-foreground">tools.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p
                className={`text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                  }`}
              >
                Streamline your event management with features designed to
                maximize efficiency, engagement, and success.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.number}
              className={`relative bg-muted/40 border border-border min-h-[300px] overflow-hidden group transition-all duration-700 flex ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
                }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative flex-1 p-8 lg:p-12">
                <div className="relative z-10">
                  <span className="font-mono text-sm text-muted-foreground">
                    {feature.number}
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-display mt-4 mb-6 group-hover:translate-x-2 transition-transform duration-500 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-8">
                    {feature.description}
                  </p>
                  <div className="mt-auto">
                    <span className="text-4xl lg:text-5xl font-display text-foreground">
                      {feature.stats.value}
                    </span>
                    <span className="block text-sm text-muted-foreground font-mono mt-2 uppercase tracking-wider">
                      {feature.stats.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
