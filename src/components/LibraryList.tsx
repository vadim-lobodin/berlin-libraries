"use client"

import { useState, useMemo, useRef } from "react"
import StarFilled from "@carbon/icons-react/lib/StarFilled"
import Search from "@carbon/icons-react/lib/Search"
import Close from "@carbon/icons-react/lib/Close"
import { motion, AnimatePresence } from "motion/react"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import { calculateDistance, BERLIN_CENTER } from "../lib/library-utils"

interface LibraryListProps {
  setLibraryCoordinates: (coordinates: [number, number]) => void
  setSelectedLibraryId: (id: number | null) => void
  userLocation: [number, number] | null
  favorites: Set<number>
}

export interface SortedLibraryEntry {
  library: Library
  distance: number
}

export default function LibraryList({
  setLibraryCoordinates,
  setSelectedLibraryId,
  userLocation,
  favorites,
}: LibraryListProps) {
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const withDistance = useMemo(() => {
    const referencePoint = userLocation || BERLIN_CENTER
    return libraries.map(lib => ({
      library: lib as Library,
      distance: calculateDistance(referencePoint[1], referencePoint[0], lib.coordinates[1], lib.coordinates[0])
    }))
  }, [userLocation])

  const sortedLibraries = useMemo(() => {
    let filtered = withDistance

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(e => e.library.name.toLowerCase().includes(q))
    }

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      const aFav = favorites.has(a.library.id) ? 0 : 1
      const bFav = favorites.has(b.library.id) ? 0 : 1
      if (aFav !== bFav) return aFav - bFav
      return a.distance - b.distance
    })

    return sorted
  }, [withDistance, search, favorites])

  const handleCloseSearch = () => {
    setSearchOpen(false)
    setSearch("")
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Top card – logo / search */}
      <div className="bg-black text-white rounded-[18px] px-6 pt-5 pb-4" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <div className="flex items-center justify-between h-12">
          <AnimatePresence mode="wait" initial={false}>
            {searchOpen ? (
              <motion.div
                key="search"
                className="flex-1 relative mr-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                onAnimationComplete={() => searchInputRef.current?.focus()}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && handleCloseSearch()}
                  className="w-full h-12 pl-4 pr-5 rounded-full bg-white/15 text-[1rem] font-medium tracking-[-0.01em] placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/20 transition-shadow"
                />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                className="h-12 flex items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <img src="/libraries/logotype.svg" alt="Berlin Library Guide" className="h-10" style={{ filter: 'brightness(0) invert(1)' }} />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => searchOpen ? handleCloseSearch() : setSearchOpen(true)}
            className="w-12 h-12 -mr-2 rounded-full flex-shrink-0 flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            {searchOpen ? <Close size={28} /> : <Search size={28} />}
          </button>
        </div>
      </div>

      {/* Bottom card – library items */}
      <div className="relative bg-card rounded-[18px] border border-white/40 flex-1 min-h-0 overflow-hidden text-black" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <div className="h-full overflow-y-auto scrollbar-hide">
          {sortedLibraries.map(({ library, distance }) => (
            <button
              key={library.id}
              onClick={() => {
                setLibraryCoordinates(library.coordinates as [number, number])
                setSelectedLibraryId(library.id)
              }}
              className="w-full px-6 py-4 hover:bg-[#f8f8f6] flex justify-between items-center border-b border-[#f0f0f0] text-left transition-colors"
            >
              <span className="text-[1rem] font-semibold tracking-[-0.01em] flex items-center gap-1.5">
                {favorites.has(library.id) && <StarFilled size={14} className="flex-shrink-0" style={{ color: '#000000' }} />}
                {library.name}
              </span>
              <span className="text-[#888] text-[0.85rem] font-mono tracking-[0.05em] ml-2 flex-shrink-0">
                {distance.toFixed(1)} km
              </span>
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-[18px]" />
      </div>
    </div>
  )
}
