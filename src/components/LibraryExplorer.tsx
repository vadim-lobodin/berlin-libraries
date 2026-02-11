"use client"

import LibraryList from "./LibraryList"
import LibraryDetail from "./LibraryDetail"
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { useUserLocation } from '../hooks/useUserLocation'
import { motion, AnimatePresence } from 'motion/react'
import CloseLarge from '@carbon/icons-react/lib/CloseLarge'
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
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem('library-favorites')
      if (saved) setFavorites(new Set(JSON.parse(saved)))
    } catch {}
  }, [])
  const { userLocation } = useUserLocation()

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('library-favorites', JSON.stringify(Array.from(next)))
      return next
    })
  }

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLibraryId !== null) {
        handleBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLibraryId])

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
      </motion.div>
      <AnimatePresence mode="wait">
        {selectedEntry ? (
          <motion.div
            key="detail"
            className="absolute left-4 right-4 bottom-4 md:left-5 md:top-5 md:bottom-5 w-[calc(100%-32px)] md:w-1/3 md:max-w-md h-1/2 md:h-auto flex flex-col gap-3"
            style={{ transformOrigin: 'center center' }}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }}
            exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}
          >
            <LibraryDetail
              library={selectedEntry.library}
              distance={selectedEntry.distance}
              onBack={handleBack}
              isFavorite={favorites.has(selectedEntry.library.id)}
              onToggleFavorite={() => toggleFavorite(selectedEntry.library.id)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="absolute left-4 right-4 bottom-4 md:left-5 md:top-5 md:bottom-5 w-[calc(100%-32px)] md:w-1/3 md:max-w-md h-1/2 md:h-auto flex flex-col gap-3"
            style={{ transformOrigin: 'center center' }}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }}
            exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}
          >
            <LibraryList
              setLibraryCoordinates={setLibraryCoordinates}
              setSelectedLibraryId={setSelectedLibraryId}
              userLocation={userLocation}
              favorites={favorites}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedEntry && (
          <motion.button
            onClick={handleBack}
            className="absolute md:left-[calc(min(33.333%,28rem)+2.5rem)] md:top-5 right-5 bottom-[calc(50%+1.75rem)] md:bottom-auto w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white rounded-full transition-colors"
            style={{ boxShadow: 'var(--shadow-soft)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <CloseLarge size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
