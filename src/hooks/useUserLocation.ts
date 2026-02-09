import { useState, useEffect, useCallback } from 'react';
import { calculateDistance, BERLIN_CENTER } from '../lib/library-utils';

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
        () => {
          setUserLocation(BERLIN_CENTER);
        }
      );
    } else {
      setUserLocation(BERLIN_CENTER);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return { userLocation };
}
