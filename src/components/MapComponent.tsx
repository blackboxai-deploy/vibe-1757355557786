'use client';

import { useEffect, useRef } from 'react';
import { LocationData } from '@/types';

interface MapComponentProps {
  locations: LocationData[];
  height?: string;
  onMarkerClick?: (location: LocationData) => void;
}

export default function MapComponent({ 
  locations, 
  height = '400px',
  onMarkerClick 
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix for default markers in webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Initialize map if not already created
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      if (locations.length > 0) {
        // Add new markers
        locations.forEach((location) => {
          const marker = L.marker([location.latitude, location.longitude])
            .addTo(mapInstanceRef.current);

          // Create popup content
          const popupContent = `
            <div class="p-2">
              <div class="font-semibold text-sm mb-1">Location Details</div>
              <div class="text-xs space-y-1">
                <div><strong>Lat:</strong> ${location.latitude.toFixed(6)}</div>
                <div><strong>Lng:</strong> ${location.longitude.toFixed(6)}</div>
                <div><strong>Time:</strong> ${new Date(location.timestamp).toLocaleString()}</div>
                ${location.accuracy ? `<div><strong>Accuracy:</strong> ${location.accuracy}m</div>` : ''}
                ${location.city ? `<div><strong>City:</strong> ${location.city}</div>` : ''}
                ${location.country ? `<div><strong>Country:</strong> ${location.country}</div>` : ''}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          if (onMarkerClick) {
            marker.on('click', () => onMarkerClick(location));
          }

          markersRef.current.push(marker);
        });

        // Fit map to show all markers
        const group = new L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, onMarkerClick]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      />
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border shadow-sm"
      />
    </>
  );
}