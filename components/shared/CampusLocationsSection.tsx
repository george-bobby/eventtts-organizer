"use client";

import { useState } from "react";
import { campusLocations, locationImages } from "@/lib/campus-data";

const locations = [
  {
    name: "Main Gate",
    description:
      "The primary entrance to the campus, featuring the college emblem and security checkpoint.",
    coordinates: "12.863788, 77.434897",
    image: "loc_images/class1.jpg",
  },
  {
    name: "Cross Road",
    description: "A central intersection connecting major campus blocks.",
    coordinates: "12.863200, 77.435100",
    image: "loc_images/class2.jpg",
  },
  {
    name: "Block 1",
    description: "Academic block housing classrooms and faculty offices.",
    coordinates: "12.863500, 77.434500",
    image: "loc_images/class3.jpg",
  },
  {
    name: "Students Square",
    description: "Open area for student gatherings and events.",
    coordinates: "12.863900, 77.434700",
    image: "loc_images/class4.jpg",
  },
  {
    name: "Open Auditorium",
    description: "Outdoor venue for performances and ceremonies.",
    coordinates: "12.862510, 77.438496",
    image: "loc_images/class5.jpg",
  },
  {
    name: "Block 4",
    description: "Academic block with labs and seminar halls.",
    coordinates: "12.864200, 77.434900",
    image: "loc_images/class6.jpg",
  },
  {
    name: "Xpress Cafe",
    description: "Popular campus cafe for snacks and beverages.",
    coordinates: "12.864300, 77.435000",
    image: "loc_images/class7.jpg",
  },
  {
    name: "Block 6",
    description: "Academic block for specialized courses.",
    coordinates: "12.864400, 77.435100",
    image: "loc_images/class8.jpg",
  },
  {
    name: "Amphi Theater",
    description:
      "A semi-circular outdoor theater used for cultural events and ceremonies.",
    coordinates: "12.861424, 77.438057",
    image: "loc_images/class9.jpg",
  },
  {
    name: "PU Block",
    description: "Block for pre-university courses and activities.",
    coordinates: "12.864500, 77.435200",
    image: "loc_images/class10.jpg",
  },
  {
    name: "Architecture Block",
    description: "Block dedicated to architecture studies and studios.",
    coordinates: "12.864600, 77.435300",
    image: "loc_images/class11.jpg",
  },
];

export default function CampusLocationsSection() {
  const [selected, setSelected] = useState(0);

  return (
    <section id="locations" className="w-full py-16 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col items-center">
      <div className="mb-12 lg:mb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-border" />
          Campus Overview
          <span className="w-8 h-px bg-border" />
        </div>
        <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-display tracking-tight leading-[0.9] text-foreground mb-6">
          Campus Locations.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore the 11 key locations around campus that our AI model can recognize.
          These are the places you can navigate to and from using our navigation system.
        </p>
      </div>

      {/* Tabs in two parallel rows, centered and spaced evenly */}
      <div className="flex flex-col gap-4 w-full max-w-4xl mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {locations.slice(0, 6).map((loc, idx) => (
            <button
              key={loc.name}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 focus:outline-none text-sm border ${selected === idx
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-muted/40 text-foreground hover:bg-muted border-border"
                }`}
              onClick={() => setSelected(idx)}
            >
              {loc.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {locations.slice(6).map((loc, idx) => (
            <button
              key={loc.name}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 focus:outline-none text-sm border ${selected === idx + 6
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-muted/40 text-foreground hover:bg-muted border-border"
                }`}
              onClick={() => setSelected(idx + 6)}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content card: image and description side by side */}
      <div className="flex flex-col md:flex-row items-stretch bg-card border border-border rounded-2xl overflow-hidden w-full max-w-5xl mx-auto">
        {/* Left - Image */}
        <div className="w-full md:w-1/2 h-64 md:h-[400px]">
          <img
            src={locations[selected].image}
            alt={locations[selected].name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Right - Centered Text */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-4xl font-display font-bold mb-4 text-foreground">
            {locations[selected].name}
          </h3>
          <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
            {locations[selected].description}
          </p>
          <div className="mt-auto">
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider block mb-1">
              Coordinates
            </span>
            <span className="font-medium text-foreground">
              {locations[selected].coordinates}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
