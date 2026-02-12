"use client"

import { Library } from "../types/library"
import Close from "@carbon/icons-react/lib/Close"
import Cursor_2 from "@carbon/icons-react/lib/Cursor_2"
import Wikis from "@carbon/icons-react/lib/Wikis"
import Star from "@carbon/icons-react/lib/Star"
import StarFilled from "@carbon/icons-react/lib/StarFilled"
import Indicator from "./Indicator"
import PhotoCarousel from "./PhotoCarousel"
import { motion, AnimatePresence } from "motion/react"
import { getStatusLabel, getLibraryColor } from "../lib/library-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface LibraryDetailProps {
  library: Library
  distance: number
  onBack: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

const renderInfoItem = (label: string, value: string | number | React.ReactNode) => (
  <div className="pt-4 pb-3">
    <h3 className="text-[0.8rem] font-mono font-normal text-[#888] tracking-[0.05em] uppercase mb-2.5">{label}</h3>
    <p className="text-[1rem] font-medium leading-[1.1] tracking-[-0.01em]">{value}</p>
  </div>
)

const renderRow = (left: React.ReactNode, right: React.ReactNode) => (
  <div className="grid grid-cols-2 border-b border-[#f0f0f0] -mx-6 px-6">
    <div className="pr-3">{left}</div>
    <div className="pl-3">{right}</div>
  </div>
)

export default function LibraryDetail({ library, distance, onBack, isFavorite, onToggleFavorite }: LibraryDetailProps) {
  return (
    <div className="w-full h-full flex flex-col gap-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={library.id}
          className="contents"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Top card – photo, title, address, buttons */}
          <div className="text-black rounded-[18px] px-6 pt-6 pb-6 overflow-hidden" style={{ boxShadow: 'var(--shadow-hover)', backgroundColor: getLibraryColor(library.id) }}>
            <div className="hidden md:block">
              <PhotoCarousel key={`desktop-${library.id}`} libraryId={library.id} />
            </div>
            <h2 className="text-[1.75rem] font-semibold leading-[1.15] pb-5" style={{ letterSpacing: '-0.02em' }}>{library.name}</h2>
            <div className="grid grid-cols-2 -mx-6 px-6">
              <div className="pr-3">
                <p className="text-[1.15rem] font-medium leading-[1.3] tracking-[-0.01em]">
                  {(() => {
                    const match = library.address.match(/^(.+),\s*(\d{5}.*)$/)
                    if (match) return <>{match[1]}<br />{match[2]}</>
                    return library.address
                  })()}
                </p>
              </div>
              <TooltipProvider delayDuration={300}>
                <div className="flex gap-3 pl-3">
                  {library.googlemaps && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={library.googlemaps} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-black/80 transition-colors text-white">
                          <Cursor_2 size={24} style={{ transform: 'scaleX(-1) translateX(1px)' }} />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Get Directions</TooltipContent>
                    </Tooltip>
                  )}
                  {library.website && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={library.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors">
                          <Wikis size={24} />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Website</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={onToggleFavorite} className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors">
                        {isFavorite ? <StarFilled size={24} /> : <Star size={24} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isFavorite ? "Remove Favorite" : "Add Favorite"}</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <div className="md:hidden mt-6">
              <PhotoCarousel key={`mobile-${library.id}`} libraryId={library.id} />
            </div>
          </div>

          {/* Bottom card – info grid */}
          <div className="relative bg-card text-black rounded-[18px] border border-white/40 flex-1 min-h-0 overflow-hidden" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="h-full overflow-y-auto scrollbar-hide px-6 pb-4">
              {renderRow(renderInfoItem("Distance", `${distance.toFixed(1)} km`), renderInfoItem("Workspace", <Indicator value={library.workspaceSetup} max={5} />))}
              {renderRow(renderInfoItem("Status", getStatusLabel(library.workingHours)), renderInfoItem("Power", <Indicator value={library.powerOutlets} max={5} />))}
              {renderRow(renderInfoItem("Conference", library.conferenceAreas), renderInfoItem("Ventilation", <Indicator value={library.ventilation} max={5} />))}
              {renderRow(renderInfoItem("Cafe", library.cafe), renderInfoItem("Wifi", <Indicator value={library.wifiQuality} max={5} />))}
              {renderRow(renderInfoItem("Food Nearby", library.foodOptionsNearby), renderInfoItem("Atmosphere", <Indicator value={library.professionalAtmosphere} max={5} />))}
              {renderRow(renderInfoItem("Lockers", library.lockers), renderInfoItem("Cell Signal", <Indicator value={library.cellReception} max={5} />))}
              {renderRow(renderInfoItem("Meeting Rooms", library.meetingRooms), renderInfoItem("Phone Policy", library.phoneCallPolicy))}
              {library.timeLimits && renderRow(renderInfoItem("Time Limits", library.timeLimits), <div />)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-[18px]" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
