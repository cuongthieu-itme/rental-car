import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import { locations } from "@/utils/constants";

const cartoonPinIcon = new Icon({
  iconUrl: "/images/pin.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const MapComponent = () => {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [uniqueId] = useState(() => `map-${Date.now()}-${Math.random()}`);

  useEffect(() => {
    console.log("🗺️ MapComponent useEffect triggered, uniqueId:", uniqueId);

    const container = containerRef.current;
    if (!container) {
      console.log("❌ No container found");
      return;
    }

    if (isInitializedRef.current) {
      console.log("⚠️ Already initialized, skipping");
      return;
    }

    console.log("🚀 Starting map initialization...");
    isInitializedRef.current = true;

    // Check and clean any existing Leaflet instance
    const leafletContainer = container as any;
    if (leafletContainer._leaflet_id) {
      console.log("🧹 Cleaning existing Leaflet instance");
      try {
        delete leafletContainer._leaflet_id;
        container.innerHTML = '';
        container.className = container.className.replace(/leaflet-\S+/g, '');
      } catch (error) {
        console.log("⚠️ Cleanup error:", error);
      }
    }

    // Much shorter delay - just ensure component is mounted
    const initTimer = setTimeout(() => {
      console.log("✅ Setting map ready to true");
      setIsReady(true);
    }, 50); // Reduced from 200ms to 50ms

    return () => {
      console.log("🧹 Cleanup useEffect for:", uniqueId);
      clearTimeout(initTimer);
      isInitializedRef.current = false;
      setIsReady(false);

      if (container) {
        try {
          const leafletContainer = container as any;
          if (leafletContainer._leaflet_id) {
            delete leafletContainer._leaflet_id;
          }
          container.innerHTML = '';
          container.className = '';
        } catch (error) {
          console.log("⚠️ Container cleanup error:", error);
        }
      }
    };
  }, [uniqueId]);

  console.log("🎯 MapComponent render - isReady:", isReady, "uniqueId:", uniqueId.slice(-8));

  if (!isReady) {
    return (
      <div className="mb-24 h-[600px] w-full bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
        <span className="text-gray-500">Loading map... {uniqueId.slice(-8)}</span>
      </div>
    );
  }

  console.log("🌍 Rendering actual map component");

  return (
    <div className="mb-24" style={{ height: "600px", width: "100%" }}>
      <div
        ref={containerRef}
        style={{ height: "100%", width: "100%" }}
        data-map-id={uniqueId}
      >
        <MapContainer
          center={[-1.286389, 36.817223]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          whenReady={() => {
            console.log("🎉 Map created successfully:", uniqueId);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {locations.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={cartoonPinIcon}
            >
              <Popup>{pin.description}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;