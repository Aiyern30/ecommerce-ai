"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useRef, useEffect } from "react";
import { AddressComponents } from "./AddressAutocomplete";

interface MapDisplayProps {
  address?: AddressComponents;
  height?: string;
  zoom?: number;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
  address,
  height = "300px",
  zoom = 15,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            zoom: zoom,
            center: address
              ? { lat: address.lat!, lng: address.lng! }
              : { lat: 3.139, lng: 101.6869 }, // Default to KL
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          mapInstanceRef.current = map;

          if (address && address.lat && address.lng) {
            const marker = new google.maps.Marker({
              position: { lat: address.lat, lng: address.lng },
              map: map,
              title: address.formatted_address,
            });

            markerRef.current = marker;

            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="padding: 8px;">
                <strong>Selected Address:</strong><br/>
                ${address.formatted_address}
              </div>`,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });
          }
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();
  }, [address, zoom]);

  useEffect(() => {
    if (mapInstanceRef.current && address && address.lat && address.lng) {
      const newPosition = { lat: address.lat, lng: address.lng };

      mapInstanceRef.current.setCenter(newPosition);

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      const marker = new google.maps.Marker({
        position: newPosition,
        map: mapInstanceRef.current,
        title: address.formatted_address,
      });

      markerRef.current = marker;

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <strong>Selected Address:</strong><br/>
          ${address.formatted_address}
        </div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current!, marker);
      });
    }
  }, [address]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-lg border border-gray-300"
    />
  );
};
