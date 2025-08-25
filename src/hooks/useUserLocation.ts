import { useState, useEffect, useCallback } from 'react';

// Berlin center coordinates
const BERLIN_CENTER: [number, number] = [13.404954, 52.520008];

// Function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
          const distanceToBerlin = calculateDistance(BERLIN_CENTER[1], BERLIN_CENTER[0], userCoords[1], userCoords[0]);
          
          if (distanceToBerlin <= 30) {
            setUserLocation(userCoords);
          } else {
            setUserLocation(BERLIN_CENTER);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          setError("Unable to retrieve your location");
          setUserLocation(BERLIN_CENTER);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
      setUserLocation(BERLIN_CENTER);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return { userLocation, error };
}
