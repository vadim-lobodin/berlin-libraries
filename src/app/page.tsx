"use client"

import LibraryList from "../components/LibraryList"
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useUserLocation } from '../hooks/useUserLocation'
import { ModeToggle } from '../components/mode-toggle'

const LibraryMap = dynamic(() => import('../components/LibraryMap'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>
})

export default function Home() {
  const [libraryCoordinates, setLibraryCoordinates] = useState<[number, number] | null>(null)
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null)
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null)
  const { userLocation, error } = useUserLocation()

  const handleSetLibraryCoordinates = (coordinates: [number, number]) => {
    setLibraryCoordinates(coordinates)
  }

  const handleSetSelectedLibraryId = (id: number | null) => {
    setSelectedLibraryId(id)
  }

  return (
    <main className="relative h-screen w-screen">
      <div className="absolute inset-0">
        <LibraryMap 
          libraryCoordinates={libraryCoordinates} 
          selectedLibraryId={selectedLibraryId}
          userLocation={userLocation}
          setLibraryCoordinates={handleSetLibraryCoordinates}
          setSelectedLibraryId={handleSetSelectedLibraryId}
          setOpenAccordionItem={setOpenAccordionItem}
        />
      </div>
      <div className="absolute right-2 top-2 z-10">
        <ModeToggle />
      </div>
      <div className="absolute left-1 right-1 bottom-1 md:left-2 md:top-2 md:bottom-2 w-[calc(100%-8px)] md:w-1/3 md:max-w-md bg-background/80 backdrop-blur-sm overflow-y-auto rounded-t-lg md:rounded-lg shadow-lg h-1/2 md:h-auto">
        <LibraryList 
          setLibraryCoordinates={handleSetLibraryCoordinates}
          setSelectedLibraryId={handleSetSelectedLibraryId}
          userLocation={userLocation}
          openAccordionItem={openAccordionItem}
          setOpenAccordionItem={setOpenAccordionItem}
        />
      </div>
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
        </div>
      )}
    </main>
  )
}
