"use client"

import { useState, useEffect } from "react"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
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
    <div className="w-full h-full bg-card text-card-foreground overflow-y-auto scrollbar-hide">
      <div className="px-6 pt-6 pb-3">
        <h1 className="text-[2rem]">Libraries</h1>
        <p className="text-[#555] text-[1.1rem] mt-2 font-normal leading-[1.4]">
          Berlin&apos;s best workspaces for focused work.
        </p>
      </div>
      <div>
        {sortedLibraries.map(({ library, distance }) => (
          <button
            key={library.id}
            onClick={() => {
              setLibraryCoordinates(library.coordinates as [number, number])
              setSelectedLibraryId(library.id)
            }}
            className="w-full px-6 py-3.5 hover:bg-[#f8f8f6] flex justify-between items-center border-b border-[#f0f0f0] text-left transition-colors"
          >
            <span className="text-[0.9rem] font-semibold tracking-[-0.01em]">{library.name}</span>
            <span className="text-[#888] text-[0.85rem] font-mono tracking-[0.05em] ml-2 flex-shrink-0">
              {distance.toFixed(1)} km
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
