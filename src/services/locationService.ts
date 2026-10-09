import { useState, useEffect, useRef } from 'react';

export interface LocationState {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
}

export const useUserLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        lat: null,
        lng: null,
        accuracy: null,
        error: null,
        loading: true,
    });

    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: "Geolocation is not supported by your browser", loading: false }));
            return;
        }

        // Only set loading if it wasn't already (optional optimization)
        // setLocation(prev => ({ ...prev, loading: true, error: null })); 

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let errorMessage = "Unable to retrieve location";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Location permission denied. Please enable it in browser settings.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = "Location information is unavailable.";
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = "The request to get user location timed out.";
                }
                setLocation(prev => ({ ...prev, error: errorMessage, loading: false }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    useEffect(() => {
        // Just call it, don't setState synchronously in the body of effect?
        // Actually the issue was line 58 logic in lint.
        // Calling it here is fine as long as the function itself is stable or we suppress.
        // But better is to just let it match standard pattern.
        getCurrentPosition();
    }, []);

    return { location, refreshLocation: getCurrentPosition };
};

export const useWatchLocation = (active: boolean = false) => {
    const [location, setLocation] = useState<LocationState>({
        lat: null,
        lng: null,
        accuracy: null,
        error: null,
        loading: true,
    });
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        if (!active) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: "Geolocation not supported", loading: false }));
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                setLocation(prev => ({ ...prev, error: error.message, loading: false }));
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [active]);

    return location;
};

export const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        return data.display_name || "Unknown Location";
    } catch (error) {
        console.error("Geocoding error:", error);
        return "Location lookup failed";
    }
};
