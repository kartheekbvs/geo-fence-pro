
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapComponent } from './components/MapComponent';
import { ControlPanel } from './components/ControlPanel';
import { EventHistory } from './components/EventHistory';
import { LoginScreen } from './components/LoginScreen';
import { useGeolocation } from './hooks/useGeolocation';
import { GeoFence, UserLocation, NotificationEvent, FenceStatus, UserProfile } from './types';
import { getDistanceInMeters } from './services/geolocationService';

declare const google: any;
const CLIENT_ID = '1082736384132-u0qprf9bmh3beq24sete7rk6pfdrq8ij.apps.googleusercontent.com';

const App: React.FC = () => {
    const { location, error, startTracking, stopTracking, isTracking } = useGeolocation();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [fences, setFences] = useState<GeoFence[]>(() => {
        try {
            const storedFences = localStorage.getItem('geo-fences');
            return storedFences ? JSON.parse(storedFences) : [];
        } catch (e) {
            return [];
        }
    });
    const [events, setEvents] = useState<NotificationEvent[]>(() => {
         try {
            const storedEvents = localStorage.getItem('geo-events');
            return storedEvents ? JSON.parse(storedEvents) : [];
        } catch (e) {
            return [];
        }
    });
    const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
    const [newFenceCenter, setNewFenceCenter] = useState<[number, number] | null>(null);

    const handleLogin = useCallback((response: any) => {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            setUser({
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            });
        } catch (error) {
            console.error("Error decoding JWT", error);
        }
    }, []);
    
    const handleSignOut = useCallback(() => {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        setUser(null);
    }, []);

    useEffect(() => {
        if (user) return; // If user is logged in, do nothing.

        const signInDiv = document.getElementById('signInDiv');
        if (!signInDiv) return; // If the target div doesn't exist, do nothing.

        let attempts = 0;
        const interval = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                clearInterval(interval);
                google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: handleLogin,
                });
                google.accounts.id.renderButton(
                    signInDiv,
                    { theme: 'filled_black', size: 'large', type: 'standard', text: 'signin_with', logo_alignment: 'left' }
                );
                google.accounts.id.prompt(); // Display the One Tap dialog
            } else if (attempts > 10) { // Stop trying after 1 second
                clearInterval(interval);
                console.error("Google Identity Services script not loaded.");
            }
            attempts++;
        }, 100);

        return () => clearInterval(interval);
    }, [user, handleLogin]);

    useEffect(() => {
        localStorage.setItem('geo-fences', JSON.stringify(fences));
    }, [fences]);

    useEffect(() => {
        localStorage.setItem('geo-events', JSON.stringify(events));
    }, [events]);

    const addFence = (name: string, radius: number, lat: number, lon: number) => {
        const newFence: GeoFence = {
            id: Date.now().toString(),
            name,
            lat,
            lon,
            radius,
            status: FenceStatus.UNKNOWN,
        };
        setFences(prev => [...prev, newFence]);
        setNewFenceCenter(null);
    };

    const deleteFence = (id: string) => {
        setFences(prev => prev.filter(fence => fence.id !== id));
    };

    const addEvent = useCallback((fence: GeoFence, type: 'enter' | 'exit') => {
        const newEvent: NotificationEvent = {
            id: Date.now().toString(),
            fenceId: fence.id,
            fenceName: fence.name,
            type,
            timestamp: new Date().toISOString(),
        };
        setEvents(prev => [newEvent, ...prev]);
    }, []);

    const checkGeoFences = useCallback((currentLocation: UserLocation) => {
        setFences(prevFences => 
            prevFences.map(fence => {
                const distance = getDistanceInMeters(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    fence.lat,
                    fence.lon
                );
                
                const isInside = distance <= fence.radius;
                const previousStatus = fence.status;
                let newStatus = fence.status;

                if (isInside && previousStatus !== FenceStatus.INSIDE) {
                    addEvent(fence, 'enter');
                    newStatus = FenceStatus.INSIDE;
                } else if (!isInside && previousStatus === FenceStatus.INSIDE) {
                    addEvent(fence, 'exit');
                    newStatus = FenceStatus.OUTSIDE;
                } else if (previousStatus === FenceStatus.UNKNOWN) {
                    newStatus = isInside ? FenceStatus.INSIDE : FenceStatus.OUTSIDE;
                }

                return { ...fence, status: newStatus };
            })
        );
    }, [addEvent]);

    useEffect(() => {
        if (location) {
            checkGeoFences(location);
            setMapCenter([location.latitude, location.longitude]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]); 

    const handleMapClick = (lat: number, lon: number) => {
      setNewFenceCenter([lat, lon]);
    };

    const clearHistory = () => {
        setEvents([]);
    }

    const memoizedMap = useMemo(() => (
        <MapComponent 
            userLocation={location} 
            fences={fences} 
            center={mapCenter}
            onMapClick={handleMapClick}
            newFenceCenter={newFenceCenter}
        />
    ), [location, fences, mapCenter, newFenceCenter]);
    
    if (!user) {
        return <LoginScreen />;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 font-sans">
            <main className="flex-grow h-1/2 md:h-full">
                {memoizedMap}
            </main>
            <aside className="w-full md:w-96 lg:w-1/3 xl:w-1/4 h-1/2 md:h-full flex flex-col bg-gray-800 border-l border-gray-700 shadow-lg">
                <ControlPanel 
                    user={user}
                    onSignOut={handleSignOut}
                    isTracking={isTracking}
                    onToggleTracking={() => isTracking ? stopTracking() : startTracking()}
                    onAddFence={addFence}
                    onDeleteFence={deleteFence}
                    fences={fences}
                    locationError={error}
                    newFenceCoords={newFenceCenter}
                    clearNewFenceCoords={() => setNewFenceCenter(null)}
                />
                <EventHistory events={events} onClearHistory={clearHistory} />
            </aside>
        </div>
    );
};

export default App;
