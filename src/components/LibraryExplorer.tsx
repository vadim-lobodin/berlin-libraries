"use client"

import LibraryList from "./LibraryList"
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useUserLocation } from '../hooks/useUserLocation'

const LibraryMap = dynamic(() => import('./LibraryMap'), {
  ssr: false,
  loading: () => null
})

export default function LibraryExplorer() {
  const [libraryCoordinates, setLibraryCoordinates] = useState<[number, number] | null>(null)
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null)
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null)
  const [statusTick, setStatusTick] = useState(0)
  const { userLocation, error } = useUserLocation()

  // Refresh library statuses every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusTick(t => t + 1)
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="absolute inset-0">
        <LibraryMap
          libraryCoordinates={libraryCoordinates}
          selectedLibraryId={selectedLibraryId}
          userLocation={userLocation}
          setLibraryCoordinates={setLibraryCoordinates}
          setSelectedLibraryId={setSelectedLibraryId}
          setOpenAccordionItem={setOpenAccordionItem}
          statusTick={statusTick}
        />
      </div>
      <div className="absolute left-1 right-1 bottom-1 md:left-2 md:top-2 md:bottom-2 w-[calc(100%-8px)] md:w-1/3 md:max-w-md bg-background/80 backdrop-blur-sm overflow-hidden rounded-t-lg md:rounded-lg shadow-lg h-1/2 md:h-auto">
        <LibraryList
          setLibraryCoordinates={setLibraryCoordinates}
          setSelectedLibraryId={setSelectedLibraryId}
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
    </>
  )
}
