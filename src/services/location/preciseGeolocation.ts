/**
 * High-Precision Geolocation & Reverse Geocoding Service
 * Combines HTML5 High-Accuracy Hardware Geolocation with Reverse Geocoding APIs.
 */

export interface PreciseLocationResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  formattedAddress: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

/**
 * Requests high-precision hardware GPS coordinates from the device.
 * Uses enableHighAccuracy: true with fallback to standard network positioning.
 */
export async function getHighPrecisionCoordinates(): Promise<{ latitude: number; longitude: number; accuracyMeters: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by your browser/device.'));
    }

    // 1. Try Hardware GPS first (High Accuracy)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracyMeters: Math.round(pos.coords.accuracy || 10)
        });
      },
      (error) => {
        console.warn('[GPS] High-accuracy positioning failed/timed out, attempting standard accuracy fallback...', error.message);
        
        // 2. Fallback to standard positioning if GPS chip is slow or indoors
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: Number(pos.coords.latitude.toFixed(6)),
              longitude: Number(pos.coords.longitude.toFixed(6)),
              accuracyMeters: Math.round(pos.coords.accuracy || 50)
            });
          },
          (err) => {
            reject(new Error(`Unable to acquire GPS location: ${err.message}`));
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh reading, no cached stale coordinates
      }
    );
  });
}

/**
 * Reverse-geocodes latitude and longitude into exact street address and landmark.
 * Default: OpenStreetMap Nominatim (Free, Global, No API key required).
 * Optional: Google Maps Geocoding API if VITE_GOOGLE_MAPS_API_KEY is configured.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<PreciseLocationResult> {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Option 1: Use Google Maps Geocoding API if key is provided
  if (googleApiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return {
          latitude,
          longitude,
          accuracyMeters: 5,
          formattedAddress: data.results[0].formatted_address
        };
      }
    } catch (e) {
      console.warn('[Geocoding] Google Geocoding failed, falling back to OSM Nominatim:', e);
    }
  }

  // Option 2: OpenStreetMap Nominatim (Free, reliable, no key required)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en'
      }
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Nominatim HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const streetPart = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
    const landmarkPart = addr.amenity || addr.building || addr.commercial || '';
    const cityPart = addr.city || addr.town || addr.county || 'Indore';
    const statePart = addr.state || 'Madhya Pradesh';
    const postcode = addr.postcode || '';

    // Build a clean, precise Indian address string
    const parts = [
      landmarkPart,
      streetPart,
      addr.suburb || addr.neighbourhood,
      cityPart,
      postcode
    ].filter(Boolean);

    const formattedAddress = parts.length > 0 ? parts.join(', ') : (data.display_name || `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`);

    return {
      latitude,
      longitude,
      accuracyMeters: 10,
      formattedAddress,
      road: addr.road,
      suburb: addr.suburb,
      city: cityPart,
      state: statePart,
      postcode
    };
  } catch (error) {
    console.warn('[Geocoding] Reverse geocoding failed:', error);
    return {
      latitude,
      longitude,
      accuracyMeters: 25,
      formattedAddress: `Near Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`
    };
  }
}

/**
 * Searches locations and street addresses via forward geocoding.
 */
export async function searchAddressLocations(query: string): Promise<Array<{ address: string; latitude: number; longitude: number }>> {
  if (!query || query.trim().length < 3) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'en' }
    });
    clearTimeout(timer);

    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      address: item.display_name,
      latitude: Number(Number(item.lat).toFixed(6)),
      longitude: Number(Number(item.lon).toFixed(6))
    }));
  } catch (err) {
    console.warn('[Geocoding] Address search failed:', err);
    return [];
  }
}
