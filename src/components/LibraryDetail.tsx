"use client"

import { Library } from "../types/library"
import { X } from "lucide-react"
import Indicator from "./Indicator"
import PhotoCarousel from "./PhotoCarousel"
import { motion, AnimatePresence } from "motion/react"
import { getLibraryStatus } from "../lib/library-utils"

interface LibraryDetailProps {
  library: Library
  distance: number
  onBack: () => void
}

const renderInfoItem = (label: string, value: string | number | React.ReactNode) => (
  <>
    <h3 className="text-[0.85rem] font-mono text-[#888] tracking-[0.05em] uppercase mt-5 mb-1">{label}</h3>
    <p className="text-[0.9rem] font-medium leading-[1.5] tracking-[-0.01em]">{value}</p>
  </>
)

export default function LibraryDetail({ library, distance, onBack }: LibraryDetailProps) {
  return (
    <div className="w-full h-full flex flex-col bg-card text-card-foreground">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0] flex-shrink-0">
        <h2 className="text-[1.1rem] truncate flex-1">
          {library.name}
        </h2>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-[#f4f4f4] rounded-full flex-shrink-0 ml-2 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={library.id}
          className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.21 }}
        >
          <span className="font-mono text-[0.85rem] text-[#888] tracking-[0.05em]">{distance.toFixed(1)} KM AWAY</span>
          <div className="mt-4">
            <PhotoCarousel key={library.id} libraryId={library.id} />
          </div>
          <div className="flex flex-wrap mt-2">
            <div className="w-1/2 pr-3">
              {renderInfoItem("Address", library.address)}
              {renderInfoItem("Status", getLibraryStatus(library.workingHours))}
              {renderInfoItem("Conference", library.conferenceAreas)}
              {renderInfoItem("Cafe", library.cafe)}
              {renderInfoItem("Food Nearby", library.foodOptionsNearby)}
              {renderInfoItem("Lockers", library.lockers)}
              {renderInfoItem("Meeting Rooms", library.meetingRooms)}
              {renderInfoItem("Phone Policy", library.phoneCallPolicy)}
              {library.timeLimits && renderInfoItem("Time Limits", library.timeLimits)}
            </div>
            <div className="w-1/2 pl-3">
              {renderInfoItem("Workspace", <Indicator value={library.workspaceSetup} max={5} />)}
              {renderInfoItem("Power", <Indicator value={library.powerOutlets} max={5} />)}
              {renderInfoItem("Ventilation", <Indicator value={library.ventilation} max={5} />)}
              {renderInfoItem("Wifi", <Indicator value={library.wifiQuality} max={5} />)}
              {renderInfoItem("Atmosphere", <Indicator value={library.professionalAtmosphere} max={5} />)}
              {renderInfoItem("Cell Signal", <Indicator value={library.cellReception} max={5} />)}
              {renderInfoItem("Hours", (
                <ul className="space-y-0.5">
                  {Object.entries(library.workingHours).map(([day, hours]) => (
                    <li key={day} className="text-[0.9rem] capitalize leading-[1.5] tracking-[-0.01em]">
                      {day}: {hours}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
