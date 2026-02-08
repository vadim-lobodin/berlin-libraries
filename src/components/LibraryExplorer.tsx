"use client"

import LibraryList from "./LibraryList"
import LibraryDetail from "./LibraryDetail"
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { useUserLocation } from '../hooks/useUserLocation'
import { motion, AnimatePresence } from 'motion/react'
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import { calculateDistance, BERLIN_CENTER } from "../lib/library-utils"

const LibraryMap = dynamic(() => import('./LibraryMap'), {
  ssr: false,
  loading: () => null
})

export default function LibraryExplorer() {
  const [libraryCoordinates, setLibraryCoordinates] = useState<[number, number] | null>(null)
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null)
  const [statusTick, setStatusTick] = useState(0)
  const { userLocation, error } = useUserLocation()

  // Refresh library statuses every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusTick(t => t + 1)
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Pre-compute distances so we can pass to the detail view
  const libraryDistances = useMemo(() => {
    const ref = userLocation || BERLIN_CENTER
    const map: Record<number, { library: Library; distance: number }> = {}
    libraries.forEach(lib => {
      map[lib.id] = {
        library: lib as Library,
        distance: calculateDistance(ref[1], ref[0], lib.coordinates[1], lib.coordinates[0])
      }
    })
    return map
  }, [userLocation])

  const selectedEntry = selectedLibraryId !== null ? libraryDistances[selectedLibraryId] : null

  const handleBack = () => {
    setSelectedLibraryId(null)
  }

  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <LibraryMap
          libraryCoordinates={libraryCoordinates}
          selectedLibraryId={selectedLibraryId}
          userLocation={userLocation}
          setLibraryCoordinates={setLibraryCoordinates}
          setSelectedLibraryId={setSelectedLibraryId}
          statusTick={statusTick}
        />
        <div className="absolute inset-0 bg-[#E2DFD9]/20 pointer-events-none" />
      </motion.div>
      <div className="absolute left-4 right-4 bottom-4 md:left-10 md:top-10 md:bottom-10 w-[calc(100%-32px)] md:w-1/3 md:max-w-md h-1/2 md:h-auto bg-card overflow-hidden rounded-[32px] border border-white/40" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <AnimatePresence mode="popLayout">
          {selectedEntry ? (
            <motion.div
              key="detail"
              className="absolute inset-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <LibraryDetail
                library={selectedEntry.library}
                distance={selectedEntry.distance}
                onBack={handleBack}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="absolute inset-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <LibraryList
                setLibraryCoordinates={setLibraryCoordinates}
                setSelectedLibraryId={setSelectedLibraryId}
                userLocation={userLocation}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-[32px]" />
      </div>
      {error && (
        <motion.div
          className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {error}
        </motion.div>
      )}
    </>
  )
}
