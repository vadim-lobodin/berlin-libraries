"use client"

import LibraryList from "../components/LibraryList"
import dynamic from 'next/dynamic'
import { useState } from 'react'

const LibraryMap = dynamic(() => import('../components/LibraryMap'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>
})

export default function Home() {
  const [libraryCoordinates, setLibraryCoordinates] = useState<[number, number] | null>(null)
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null)

  return (
    <main className="relative h-screen w-screen">
      <div className="absolute inset-0">
        <LibraryMap 
          libraryCoordinates={libraryCoordinates} 
          selectedLibraryId={selectedLibraryId}
        />
      </div>
      <div className="absolute left-0 right-0 bottom-0 md:left-2 md:top-2 md:bottom-2 w-full md:w-1/3 md:max-w-md bg-background/80 backdrop-blur-sm overflow-y-auto rounded-t-lg md:rounded-lg shadow-lg h-1/3 md:h-auto">
        <LibraryList 
          setLibraryCoordinates={setLibraryCoordinates}
          setSelectedLibraryId={setSelectedLibraryId}
        />
      </div>
    </main>
  )
}
