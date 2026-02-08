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
    <h3 className="font-normal text-gray-400 mt-4 mb-1 leading-5">{label}:</h3>
    <p className="mb-4 leading-4">{value}</p>
  </>
)

export default function LibraryDetail({ library, distance, onBack }: LibraryDetailProps) {
  return (
    <div className="w-full h-full flex flex-col bg-background/80 text-foreground">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="text-sm md:text-base font-light truncate flex-1">
          {library.name}
        </h2>
        <button onClick={onBack} className="p-1 hover:bg-accent rounded-md flex-shrink-0 ml-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={library.id}
          className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.21 }}
        >
          <p className="text-gray-500 text-xs md:text-sm mb-3">{distance.toFixed(1)} km away</p>
          <PhotoCarousel key={library.id} libraryId={library.id} />
          <div className="flex flex-wrap">
            <div className="w-1/2 pr-2">
              {renderInfoItem("Address", library.address)}
              {renderInfoItem("Status", getLibraryStatus(library.workingHours))}
              {renderInfoItem("Conference Areas", library.conferenceAreas)}
              {renderInfoItem("Cafe", library.cafe)}
              {renderInfoItem("Food Options Nearby", library.foodOptionsNearby)}
              {renderInfoItem("Lockers", library.lockers)}
              {renderInfoItem("Meeting Rooms", library.meetingRooms)}
              {renderInfoItem("Phone Call Policy", library.phoneCallPolicy)}
              {library.timeLimits && renderInfoItem("Time Limits", library.timeLimits)}
            </div>
            <div className="w-1/2 pl-2">
              {renderInfoItem("Workspace Setup", <Indicator value={library.workspaceSetup} max={5} />)}
              {renderInfoItem("Power Outlets", <Indicator value={library.powerOutlets} max={5} />)}
              {renderInfoItem("Ventilation", <Indicator value={library.ventilation} max={5} />)}
              {renderInfoItem("Wifi Quality", <Indicator value={library.wifiQuality} max={5} />)}
              {renderInfoItem("Atmosphere", <Indicator value={library.professionalAtmosphere} max={5} />)}
              {renderInfoItem("Cell Reception", <Indicator value={library.cellReception} max={5} />)}
              {renderInfoItem("Working Hours", (
                <ul className="space-y-1">
                  {Object.entries(library.workingHours).map(([day, hours]) => (
                    <li key={day} className="capitalize leading-5">
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
