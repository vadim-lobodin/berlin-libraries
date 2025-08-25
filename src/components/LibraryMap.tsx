"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import { format, parse, isWithinInterval, addHours, subHours } from 'date-fns'

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

mapboxgl.accessToken = mapboxToken

interface LibraryMapProps {
  libraryCoordinates: [number, number] | null
  selectedLibraryId: number | null
  userLocation: [number, number] | null
  setLibraryCoordinates: (coordinates: [number, number]) => void
  setSelectedLibraryId: (id: number | null) => void
  setOpenAccordionItem: (value: string | null) => void
}

const getLibraryStatus = (workingHours: { [key: string]: string }): 'Open' | 'Closed' | 'Opens Soon' | 'Closes Soon' => {
  const now = new Date()
  const dayOfWeek = format(now, 'EEEE').toLowerCase()
  const currentTime = format(now, 'HH:mm')

  const todayHours = workingHours[dayOfWeek]
  if (todayHours === "Closed") return "Closed"

  const [openTime, closeTime] = todayHours.split(" - ")
  const openDateTime = parse(openTime, 'HH:mm', now)
  const closeDateTime = parse(closeTime, 'HH:mm', now)

  if (isWithinInterval(now, { start: openDateTime, end: closeDateTime })) {
    if (isWithinInterval(now, { start: subHours(closeDateTime, 1), end: closeDateTime })) {
      return "Closes Soon"
    }
    return "Open"
  }

  if (isWithinInterval(now, { start: subHours(openDateTime, 1), end: openDateTime })) {
    return "Opens Soon"
  }

  return "Closed"
}

// Berlin center coordinates
const BERLIN_CENTER: [number, number] = [13.404954, 52.520008];

export default function LibraryMap({ 
  libraryCoordinates, 
  selectedLibraryId,
  userLocation,
  setLibraryCoordinates,
  setSelectedLibraryId,
  setOpenAccordionItem
}: LibraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const markersRef = useRef<{ [key: number]: mapboxgl.Marker }>({})

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
        const mapStyle = "mapbox://styles/mapbox/dark-v11"
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: mapStyle,
          center: BERLIN_CENTER,
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
          addLibraryMarkers()
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
  }, [])

  const addLibraryMarkers = useCallback(() => {
    if (!map.current || !mapLoaded) return

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add library markers
    libraries.forEach((library) => {
      const status = getLibraryStatus(library.workingHours)
      const isSelected = library.id === selectedLibraryId

      const el = createCircleMarker(status, isSelected)
      
      // Add click handler to marker element
      el.addEventListener('click', () => {
        setLibraryCoordinates(library.coordinates as [number, number])
        setSelectedLibraryId(library.id)
        setOpenAccordionItem(`item-${library.id}`)
      })

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(library.coordinates as [number, number])
        .addTo(map.current!)

      markersRef.current[library.id] = marker
    })
  }, [mapLoaded, selectedLibraryId, setLibraryCoordinates, setSelectedLibraryId, setOpenAccordionItem])

  useEffect(() => {
    addLibraryMarkers()
  }, [addLibraryMarkers])

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

      map.current.flyTo({
        center: userLocation,
        zoom: 11
      });
    }
  }, [mapLoaded, userLocation]);

  // Function to create a circular marker
  const createCircleMarker = (status: 'Open' | 'Closed' | 'Opens Soon' | 'Closes Soon' | string, isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = isSelected ? '12px' : '10px';
    el.style.height = isSelected ? '12px' : '10px';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';
    
    if (typeof status === 'string' && status.startsWith('#')) {
      el.style.backgroundColor = status;
    } else {
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
