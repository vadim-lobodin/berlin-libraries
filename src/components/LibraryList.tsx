"use client"

import { useState, useEffect, useMemo } from "react"
import StarFilled from "@carbon/icons-react/lib/StarFilled"
import Search from "@carbon/icons-react/lib/Search"
import ChevronDown from "@carbon/icons-react/lib/ChevronDown"
import ChevronUp from "@carbon/icons-react/lib/ChevronUp"
import { motion, AnimatePresence } from "motion/react"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import { calculateDistance, getLibraryStatus, BERLIN_CENTER } from "../lib/library-utils"

type SortMode = "distance" | "name" | "open"

const SORT_LABELS: Record<SortMode, string> = {
  distance: "By distance",
  name: "By name",
  open: "Only open",
}

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
  const [sortMode, setSortMode] = useState<SortMode>("distance")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

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

    if (sortMode === "open") {
      filtered = filtered.filter(e => {
        const status = getLibraryStatus(e.library.workingHours)
        return status === "Open" || status === "Closes Soon" || status === "Opens Soon"
      })
    }

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      const aFav = favorites.has(a.library.id) ? 0 : 1
      const bFav = favorites.has(b.library.id) ? 0 : 1
      if (aFav !== bFav) return aFav - bFav

      if (sortMode === "name") return a.library.name.localeCompare(b.library.name)
      return a.distance - b.distance
    })

    return sorted
  }, [withDistance, search, sortMode, favorites])

  return (
    <div className="w-full h-full bg-card text-card-foreground overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-card px-6 pt-6 pb-5 border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between">
          <img src="/logotype.svg" alt="LIBRA" className="h-7" style={{ filter: 'brightness(0)' }} />
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="w-12 h-12 rounded-full bg-[#f4f4f4] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
          >
            {filtersOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, overflow: "visible" }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-3">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-12 pl-11 pr-5 rounded-full bg-[#f4f4f4] text-[1rem] font-medium tracking-[-0.01em] placeholder:text-[#aaa] outline-none focus:ring-1 focus:ring-black/10 transition-shadow"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="h-12 px-5 rounded-full bg-[#f4f4f4] flex items-center gap-1.5 text-[1rem] font-medium tracking-[-0.01em] hover:bg-[#e8e8e8] transition-colors whitespace-nowrap"
                  >
                    {SORT_LABELS[sortMode]}
                    <ChevronDown size={14} />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl border border-[#f0f0f0] py-1 min-w-[140px]" style={{ boxShadow: 'var(--shadow-soft)' }}>
                        {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                          <button
                            key={mode}
                            onClick={() => { setSortMode(mode); setDropdownOpen(false) }}
                            className={`w-full text-left px-5 py-2.5 text-[1rem] font-medium hover:bg-[#f8f8f6] transition-colors ${sortMode === mode ? 'text-black' : 'text-[#888]'}`}
                          >
                            {SORT_LABELS[mode]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            <span className="text-[1rem] font-semibold tracking-[-0.01em] flex items-center gap-1.5">
              {favorites.has(library.id) && <StarFilled size={14} className="flex-shrink-0" style={{ color: '#FF0000' }} />}
              {library.name}
            </span>
            <span className="text-[#888] text-[0.85rem] font-mono tracking-[0.05em] ml-2 flex-shrink-0">
              {distance.toFixed(1)} km
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
