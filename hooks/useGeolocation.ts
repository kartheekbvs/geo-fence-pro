
import { useState, useRef, useCallback } from 'react';
import { UserLocation } from '../types';

export const useGeolocation = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const watchId = useRef<number | null>(null);

    const handleSuccess = (position: GeolocationPosition) => {
        setError(null);
        setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
        });
    };

    const handleError = (error: GeolocationPositionError) => {
        setError(error.message);
    };

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        
        setIsTracking(true);
        watchId.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    const stopTracking = useCallback(() => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
    }, []);

    return { location, error, startTracking, stopTracking, isTracking };
};
