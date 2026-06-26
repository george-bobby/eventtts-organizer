"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { campusLocations } from "@/lib/campus-data";

interface NavigationMapProps {
  startLocation: string;
  endLocation: string;
}

// ✅ Fix for Leaflet marker icons in Next.js
let iconsFixed = false;
const fixLeafletIcon = () => {
  if (iconsFixed) return;
  iconsFixed = true;
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

export default function NavigationMap({
  startLocation,
  endLocation,
}: NavigationMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    fixLeafletIcon();
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const startPoint = campusLocations.find((loc) => loc.name === startLocation);
    const endPoint = campusLocations.find((loc) => loc.name === endLocation);

    if (!startPoint || !endPoint) return;

    const centerLat = (startPoint.lat + endPoint.lat) / 2;
    const centerLng = (startPoint.lng + endPoint.lng) / 2;

    // 1. Initialize map (only if not already initialized)
    // Leaflet binds map to the DOM element. In case of strict-mode or hot-reloading,
    // we make sure we clean up the previous instance first.
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (err) {
        console.warn("Error removing map instance:", err);
      }
      mapRef.current = null;
    }

    // Double check to clear any internal Leaflet ID on the DOM container
    if (containerRef.current) {
      // @ts-ignore
      containerRef.current._leaflet_id = null;
    }

    try {
      const map = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 16,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      // 2. Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // 3. Add Custom Markers
      L.marker([startPoint.lat, startPoint.lng])
        .bindPopup(`<b>Start:</b> ${startLocation}`)
        .addTo(map);

      L.marker([endPoint.lat, endPoint.lng])
        .bindPopup(`<b>Destination:</b> ${endLocation}`)
        .addTo(map);

      // 4. Add Routing Control
      const control = L.Routing.control({
        waypoints: [
          L.latLng(startPoint.lat, startPoint.lng),
          L.latLng(endPoint.lat, endPoint.lng),
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "#6366f1", weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        // @ts-ignore — suppress default routing machine markers
        createMarker: () => null,
      }).addTo(map);

      routingControlRef.current = control;
    } catch (err) {
      console.error("Leaflet map initialization failed:", err);
    }

    // 5. Clean up on unmount or route change
    return () => {
      if (routingControlRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch (_) {}
        routingControlRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (_) {}
        mapRef.current = null;
      }
      // Double check to clear any internal Leaflet ID on the DOM container on unmount
      if (containerRef.current) {
        // @ts-ignore
        containerRef.current._leaflet_id = null;
      }
    };
  }, [isMounted, startLocation, endLocation]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  const startPoint = campusLocations.find((loc) => loc.name === startLocation);
  const endPoint = campusLocations.find((loc) => loc.name === endLocation);

  if (!startPoint || !endPoint) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        Location data not found
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ height: "100%", width: "100%" }} 
      className="leaflet-map-container"
    />
  );
}
