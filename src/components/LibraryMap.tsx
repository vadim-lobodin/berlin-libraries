"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import libraries from "@/data/libraries.json"
import { Library } from "@/types/library"

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
console.log("Mapbox Token:", mapboxToken)

mapboxgl.accessToken = mapboxToken

const isLibraryOpen = (workingHours: { [key: string]: string }): boolean => {
  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const todayHours = workingHours[dayOfWeek]
  if (todayHours === "Closed") return false

  const [openTime, closeTime] = todayHours.split(" - ")
  const [openHour, openMinute] = openTime.split(":").map(Number)
  const [closeHour, closeMinute] = closeTime.split(":").map(Number)

  const openMinutes = openHour * 60 + openMinute
  const closeMinutes = closeHour * 60 + closeMinute

  return currentTime >= openMinutes && currentTime < closeMinutes
}

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

// Berlin center coordinates
const BERLIN_CENTER: [number, number] = [13.404954, 52.520008];

export default function LibraryMap({ 
  libraryCoordinates, 
  selectedLibraryId 
}: { 
  libraryCoordinates: [number, number] | null,
  selectedLibraryId: number | null
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (map.current) return // Initialize map only once

    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is missing")
      setError("Mapbox access token is missing")
      return
    }

    if (!mapContainer.current) return

    const initializeMap = () => {
      try {
        console.log("Initializing map...")
        console.log("Container dimensions:", mapContainer.current?.offsetWidth, mapContainer.current?.offsetHeight)
        
        const mapStyle = "mapbox://styles/mapbox/dark-v11"
        console.log("Using map style:", mapStyle)
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: mapStyle,
          center: BERLIN_CENTER, // Use Berlin center
          zoom: 11, // Adjusted initial zoom level
          pitch: 45,
          bearing: -17.6,
          antialias: true
        })

        map.current.on("style.load", () => {
          console.log("Map style loaded")
          
          // Add 3D building layer
          if (map.current!.getLayer('building')) {
            map.current!.removeLayer('building');
          }
          
          map.current!.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': .6
            }
          });
        })

        map.current.on("load", () => {
          console.log("Map loaded successfully")
          setMapLoaded(true)
          
          // Add blue circle marker for Berlin center
          new mapboxgl.Marker({
            element: createCircleMarker('#0000FF', false), // Add the second argument
            anchor: 'center'
          })
            .setLngLat(BERLIN_CENTER)
            .addTo(map.current!)

          // Add library markers
          libraries.forEach((library) => {
            const isOpen = isLibraryOpen(library.workingHours)
            const color = isOpen ? "#13DE83" : "#8D8D8D"
            const isSelected = library.id === selectedLibraryId

            new mapboxgl.Marker(createCircleMarker(color, isSelected))
              .setLngLat(library.coordinates as [number, number])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <div class="text-white">
                  <h3 class="font-bold">${library.name}</h3>
                  <p>${library.address}</p>
                  <p class="${isOpen ? 'text-[#13DE83]' : 'text-gray-400'}">${isOpen ? 'Open' : 'Closed'}</p>
                </div>
              `))
              .addTo(map.current!)
          })
        })

        map.current.on("error", (e) => {
          console.error("Mapbox error:", e)
          setError(`An error occurred while loading the map: ${e.error.message}`)
        })

        console.log("Map object:", map.current)
      } catch (err) {
        console.error("Error initializing map:", err)
        setError(`Failed to initialize the map: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Delay map initialization
    const timer = setTimeout(initializeMap, 100)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      if (map.current) {
        console.log("Removing map")
        map.current.remove()
      }
    }
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    if (map.current && libraryCoordinates) {
      map.current.flyTo({
        center: libraryCoordinates,
        zoom: 14 // Adjusted zoom level
      });
    }
  }, [libraryCoordinates]);

  const markersRef = useRef<{ [key: number]: mapboxgl.Marker }>({})

  useEffect(() => {
    if (map.current && mapLoaded) {
      // Remove existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove())
      markersRef.current = {}

      // Add library markers
      libraries.forEach((library) => {
        const isOpen = isLibraryOpen(library.workingHours)
        const color = isOpen ? "#13DE83" : "#8D8D8D"
        const isSelected = library.id === selectedLibraryId

        const marker = new mapboxgl.Marker(createCircleMarker(color, isSelected))
          .setLngLat(library.coordinates as [number, number])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="text-white">
              <h3 class="font-bold">${library.name}</h3>
              <p>${library.address}</p>
              <p class="${isOpen ? 'text-[#13DE83]' : 'text-gray-400'}">${isOpen ? 'Open' : 'Closed'}</p>
            </div>
          `))
          .addTo(map.current!)

        markersRef.current[library.id] = marker
      })
    }
  }, [mapLoaded, selectedLibraryId])

  // Function to create a circular marker
  const createCircleMarker = (color: string, isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundColor = color;
    el.style.width = isSelected ? '12px' : '10px';
    el.style.height = isSelected ? '12px' : '10px';
    el.style.borderRadius = '50%';
    if (isSelected) {
      el.style.border = '3px solid white';
      el.style.boxSizing = 'content-box';
    }
    return el;
  }

  if (error) {
    return <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          Loading map...
        </div>
      )}
    </div>
  )
}
