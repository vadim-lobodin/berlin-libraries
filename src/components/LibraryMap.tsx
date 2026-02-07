"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import libraries from "../data/libraries.json"
import { getLibraryStatus, type LibraryStatus } from "../lib/library-utils"

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

mapboxgl.accessToken = mapboxToken

interface LibraryMapProps {
  libraryCoordinates: [number, number] | null
  selectedLibraryId: number | null
  userLocation: [number, number] | null
  setLibraryCoordinates: (coordinates: [number, number]) => void
  setSelectedLibraryId: (id: number | null) => void
  statusTick: number
}

function createCircleMarker(status: LibraryStatus | string, isSelected: boolean) {
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.width = isSelected ? '12px' : '10px';
  el.style.height = isSelected ? '12px' : '10px';
  el.style.borderRadius = '50%';
  el.style.cursor = 'pointer';

  if (typeof status === 'string' && status.startsWith('#')) {
    el.style.backgroundColor = status;
  } else {
    applyStatusColor(el, status as LibraryStatus);
  }

  if (isSelected) {
    el.style.border = '3px solid white';
    el.style.boxSizing = 'content-box';
  }
  return el;
}

function applyStatusColor(el: HTMLElement, status: LibraryStatus) {
  el.style.background = '';
  el.style.backgroundColor = '';
  switch (status) {
    case 'Open':
      el.style.backgroundColor = '#13DE83';
      break;
    case 'Closed':
      el.style.backgroundColor = '#8D8D8D';
      break;
    case 'Opens Soon':
      el.style.background = 'linear-gradient(to right, #8D8D8D 50%, #13DE83 50%)';
      break;
    case 'Closes Soon':
      el.style.backgroundColor = '#FFA500';
      break;
  }
}

function applySelectionStyle(el: HTMLElement, isSelected: boolean) {
  el.style.width = isSelected ? '12px' : '10px';
  el.style.height = isSelected ? '12px' : '10px';
  if (isSelected) {
    el.style.border = '3px solid white';
    el.style.boxSizing = 'content-box';
  } else {
    el.style.border = '';
    el.style.boxSizing = '';
  }
}

export default function LibraryMap({
  libraryCoordinates,
  selectedLibraryId,
  userLocation,
  setLibraryCoordinates,
  setSelectedLibraryId,
  statusTick
}: LibraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const markersRef = useRef<Record<number, mapboxgl.Marker>>({})
  const prevSelectedIdRef = useRef<number | null>(null)

  // Store callbacks in refs to avoid recreating markers when parent re-renders
  const callbacksRef = useRef({ setLibraryCoordinates, setSelectedLibraryId })
  useEffect(() => {
    callbacksRef.current = { setLibraryCoordinates, setSelectedLibraryId }
  })

  useEffect(() => {
    if (map.current) return // Initialize map only once
    if (!userLocation) return // Wait for user location before initializing

    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is missing")
      setError("Mapbox access token is missing")
      return
    }

    if (!mapContainer.current) return

    const initializeMap = () => {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/dark-v11",
          center: userLocation,
          zoom: 11,
          pitch: 45,
          bearing: -17.6,
          antialias: true
        })

        map.current.on("style.load", () => {
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
          setMapLoaded(true)
        })

      } catch (err) {
        console.error("Error initializing map:", err)
        setError(`Failed to initialize the map: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const timer = setTimeout(initializeMap, 100)

    return () => {
      clearTimeout(timer)
      if (map.current) {
        map.current.remove()
      }
    }
  }, [userLocation])

  // Create markers once when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    libraries.forEach((library) => {
      const status = getLibraryStatus(library.workingHours)
      const el = createCircleMarker(status, false)
      el.style.animation = `markerFadeIn 1.4s ease-out both`

      el.addEventListener('click', () => {
        callbacksRef.current.setLibraryCoordinates(library.coordinates as [number, number])
        callbacksRef.current.setSelectedLibraryId(library.id)
      })

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(library.coordinates as [number, number])
        .addTo(map.current!)

      markersRef.current[library.id] = marker
    })
  }, [mapLoaded])

  // Refresh marker colors when status changes over time
  useEffect(() => {
    if (!mapLoaded || statusTick === 0) return

    libraries.forEach((library) => {
      const marker = markersRef.current[library.id]
      if (!marker) return
      applyStatusColor(marker.getElement(), getLibraryStatus(library.workingHours))
    })
  }, [statusTick, mapLoaded])

  // Update marker styles when selection changes (without recreating all markers)
  useEffect(() => {
    if (!mapLoaded) return

    const prevId = prevSelectedIdRef.current
    if (prevId !== null && markersRef.current[prevId]) {
      applySelectionStyle(markersRef.current[prevId].getElement(), false)
    }
    if (selectedLibraryId !== null && markersRef.current[selectedLibraryId]) {
      applySelectionStyle(markersRef.current[selectedLibraryId].getElement(), true)
    }
    prevSelectedIdRef.current = selectedLibraryId
  }, [selectedLibraryId, mapLoaded])

  useEffect(() => {
    if (map.current && libraryCoordinates) {
      map.current.flyTo({
        center: libraryCoordinates,
        zoom: 14
      });
    }
  }, [libraryCoordinates]);

  useEffect(() => {
    if (map.current && mapLoaded && userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
      }

      userMarkerRef.current = new mapboxgl.Marker({
        element: createCircleMarker('#0000FF', false),
        anchor: 'center'
      })
        .setLngLat(userLocation)
        .addTo(map.current);
    }
  }, [mapLoaded, userLocation]);

  if (error) {
    return <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
