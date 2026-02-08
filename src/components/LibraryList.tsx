"use client"

import { useState, useEffect } from "react"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import LogoSVG from "../media/logotype.svg"
import Image from "next/image"
import { calculateDistance, BERLIN_CENTER } from "../lib/library-utils"

interface LibraryListProps {
  setLibraryCoordinates: (coordinates: [number, number]) => void
  setSelectedLibraryId: (id: number | null) => void
  userLocation: [number, number] | null
}

export interface SortedLibraryEntry {
  library: Library
  distance: number
}

export default function LibraryList({
  setLibraryCoordinates,
  setSelectedLibraryId,
  userLocation,
}: LibraryListProps) {
  const [sortedLibraries, setSortedLibraries] = useState<SortedLibraryEntry[]>([])

  useEffect(() => {
    const referencePoint = userLocation || BERLIN_CENTER;
    const withDistance = libraries.map(lib => ({
      library: lib as Library,
      distance: calculateDistance(referencePoint[1], referencePoint[0], lib.coordinates[1], lib.coordinates[0])
    }));
    withDistance.sort((a, b) => a.distance - b.distance);
    setSortedLibraries(withDistance);
  }, [userLocation]);

  return (
    <div className="w-full h-full bg-background/80 text-foreground overflow-y-auto scrollbar-hide">
      <div className="p-4 hidden md:block sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <Image
          src={LogoSVG}
          alt="Logo"
          width={140}
          height={46}
        />
      </div>
      <div>
        {sortedLibraries.map(({ library, distance }) => (
          <button
            key={library.id}
            onClick={() => {
              setLibraryCoordinates(library.coordinates as [number, number])
              setSelectedLibraryId(library.id)
            }}
            className="w-full px-4 py-2 md:py-4 hover:bg-accent hover:text-accent-foreground font-light flex justify-between items-center border-b border-border text-left"
          >
            <span className="text-sm md:text-base">{library.name}</span>
            <span className="text-gray-500 text-xs md:text-sm ml-2 flex-shrink-0">
              {distance.toFixed(1)} km
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
