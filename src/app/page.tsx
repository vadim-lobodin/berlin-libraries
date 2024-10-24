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

  return (
    <main className="relative h-screen w-screen">
      <div className="absolute inset-0">
        <LibraryMap libraryCoordinates={libraryCoordinates} />
      </div>
      <div className="absolute left-2 top-2 bottom-2 w-1/3 max-w-md bg-background/80 backdrop-blur-sm overflow-y-auto rounded-lg shadow-lg">
        <LibraryList setLibraryCoordinates={setLibraryCoordinates} />
      </div>
    </main>
  )
}
