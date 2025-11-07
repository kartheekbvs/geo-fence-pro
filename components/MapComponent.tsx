
import React, { useEffect, useRef } from 'react';
import { UserLocation, GeoFence, FenceStatus } from '../types';

declare const L: any; // Using Leaflet from CDN

interface MapComponentProps {
    userLocation: UserLocation | null;
    fences: GeoFence[];
    center: [number, number];
    onMapClick: (lat: number, lon: number) => void;
    newFenceCenter: [number, number] | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, fences, center, onMapClick, newFenceCenter }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);
    const userMarker = useRef<any>(null);
    const accuracyCircle = useRef<any>(null);
    const fenceLayers = useRef<{[key: string]: any}>({});
    const newFenceMarker = useRef<any>(null);

    useEffect(() => {
        if (mapContainer.current && !map.current) {
            map.current = L.map(mapContainer.current).setView(center, 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map.current);

            map.current.on('click', (e: any) => {
                onMapClick(e.latlng.lat, e.latlng.lng);
            });
        }
    }, [center, onMapClick]);

    useEffect(() => {
        if (map.current) {
            map.current.setView(center, map.current.getZoom());
        }
    }, [center]);

    useEffect(() => {
        if (map.current && userLocation) {
            const userLatLng = [userLocation.latitude, userLocation.longitude];
            if (!userMarker.current) {
                userMarker.current = L.marker(userLatLng).addTo(map.current)
                    .bindPopup('Your Location');
                accuracyCircle.current = L.circle(userLatLng, {
                    radius: userLocation.accuracy,
                    weight: 1,
                    color: '#1d4ed8',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2
                }).addTo(map.current);
            } else {
                userMarker.current.setLatLng(userLatLng);
                accuracyCircle.current.setLatLng(userLatLng).setRadius(userLocation.accuracy);
            }
        }
    }, [userLocation]);

    useEffect(() => {
        if (map.current) {
            // Remove stale fence layers
            Object.keys(fenceLayers.current).forEach(fenceId => {
                if (!fences.find(f => f.id === fenceId)) {
                    map.current.removeLayer(fenceLayers.current[fenceId]);
                    delete fenceLayers.current[fenceId];
                }
            });
            
            // Add/update fence layers
            fences.forEach(fence => {
                const fenceColor = fence.status === FenceStatus.INSIDE ? '#16a34a' : '#ca8a04';
                const fenceOptions = { color: fenceColor, fillColor: fenceColor, fillOpacity: 0.2 };

                if (fenceLayers.current[fence.id]) {
                    fenceLayers.current[fence.id].setLatLng([fence.lat, fence.lon]).setRadius(fence.radius).setStyle(fenceOptions);
                } else {
                    fenceLayers.current[fence.id] = L.circle([fence.lat, fence.lon], {
                        ...fenceOptions,
                        radius: fence.radius
                    }).addTo(map.current).bindPopup(fence.name);
                }
            });
        }
    }, [fences]);

    useEffect(() => {
        if (map.current) {
            if (newFenceCenter) {
                if (!newFenceMarker.current) {
                    newFenceMarker.current = L.marker(newFenceCenter, { draggable: true }).addTo(map.current)
                        .bindPopup('New fence center. Drag to adjust.').openPopup();
                } else {
                    newFenceMarker.current.setLatLng(newFenceCenter).openPopup();
                }
            } else {
                if (newFenceMarker.current) {
                    map.current.removeLayer(newFenceMarker.current);
                    newFenceMarker.current = null;
                }
            }
        }
    }, [newFenceCenter]);

    return <div ref={mapContainer} className="leaflet-container" />;
};
