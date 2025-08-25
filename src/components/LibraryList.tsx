"use client"

import { useState, useEffect, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import LogoSVG from "../media/logotype.svg"
import Image from "next/image"
import Indicator from './Indicator'
import { cn } from "../lib/utils"
import { format, parse, isWithinInterval, addHours, subHours } from 'date-fns'

interface LibraryListProps {
  setLibraryCoordinates: (coordinates: [number, number]) => void
  setSelectedLibraryId: (id: number | null) => void
  userLocation: [number, number] | null
  openAccordionItem: string | null
  setOpenAccordionItem: (value: string | null) => void
}

// Berlin center coordinates
const BERLIN_CENTER: [number, number] = [52.520008, 13.404954];

// Function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

const getLibraryStatus = (workingHours: { [key: string]: string }): 'Open' | 'Closed' | 'Opens Soon' | 'Closes Soon' => {
  const now = new Date()
  const dayOfWeek = format(now, 'EEEE').toLowerCase()
  const currentTime = format(now, 'HH:mm')

  const todayHours = workingHours[dayOfWeek]
  if (todayHours === "Closed") return "Closed"

  const [openTime, closeTime] = todayHours.split(" - ")
  const openDateTime = parse(openTime, 'HH:mm', now)
  const closeDateTime = parse(closeTime, 'HH:mm', now)

  if (isWithinInterval(now, { start: openDateTime, end: closeDateTime })) {
    if (isWithinInterval(now, { start: subHours(closeDateTime, 1), end: closeDateTime })) {
      return "Closes Soon"
    }
    return "Open"
  }

  if (isWithinInterval(now, { start: subHours(openDateTime, 1), end: openDateTime })) {
    return "Opens Soon"
  }

  return "Closed"
}

const renderInfoItem = (label: string, value: string | number | React.ReactNode) => (
  <>
    <h3 className="font-normal text-gray-400 mt-4 mb-1 leading-5">{label}:</h3>
    <p className="mb-4 leading-4">{value}</p>
  </>
);

export default function LibraryList({ 
  setLibraryCoordinates,
  setSelectedLibraryId,
  userLocation,
  openAccordionItem,
  setOpenAccordionItem
}: LibraryListProps) {
  const [hoveredLibrary, setHoveredLibrary] = useState<number | null>(null)
  const [sortedLibraries, setSortedLibraries] = useState<Library[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sorted = [...libraries].sort((a, b) => {
      const referencePoint = userLocation || BERLIN_CENTER;
      const distA = calculateDistance(referencePoint[0], referencePoint[1], a.coordinates[0], a.coordinates[1]);
      const distB = calculateDistance(referencePoint[0], referencePoint[1], b.coordinates[0], b.coordinates[1]);
      return distA - distB;
    });
    setSortedLibraries(sorted as Library[]);
  }, [userLocation]);

  // Function to scroll to the open accordion item
  useEffect(() => {
    if (openAccordionItem && containerRef.current) {
      // Use a small delay to ensure the accordion has opened
      const timeoutId = setTimeout(() => {
        const accordionItem = document.querySelector(`[data-value="${openAccordionItem}"]`);
        const trigger = accordionItem?.querySelector('[data-radix-collection-item]') || accordionItem?.querySelector('button');
        
        if (trigger && containerRef.current) {
          const container = containerRef.current;
          
          // Get trigger position relative to container
          const triggerRect = trigger.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Calculate trigger position
          const triggerTop = triggerRect.top - containerRect.top;
          const triggerHeight = triggerRect.height;
          
          // Check if trigger (library name) is visible at the top
          const isHeaderVisible = triggerTop >= 0 && triggerTop <= 100; // Allow some buffer at top
          
          if (!isHeaderVisible) {
            // Always scroll to show the trigger at the top with padding
            const targetScrollTop = container.scrollTop + triggerTop - 10;
            
            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          }
        }
      }, 100); // Slightly longer delay to ensure accordion animation completes
      
      return () => clearTimeout(timeoutId);
    }
  }, [openAccordionItem]);

  return (
    <div className="w-full h-full bg-background/80 text-foreground overflow-y-auto flex flex-col">
      <div ref={logoRef} className="p-4 hidden md:block sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <Image 
          src={LogoSVG} 
          alt="Logo" 
          width={140}
          height={46}
        />
      </div>
      <div ref={containerRef} className={cn("flex-grow overflow-y-auto", "scrollbar-hide")}>
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={openAccordionItem || undefined}
          onValueChange={setOpenAccordionItem}
        >
          {sortedLibraries.map((library: Library) => (
            <AccordionItem
              key={library.id}
              value={`item-${library.id}`}
              data-value={`item-${library.id}`}
              onMouseEnter={() => setHoveredLibrary(library.id)}
              onMouseLeave={() => setHoveredLibrary(null)}
              onClick={() => {
                setLibraryCoordinates(library.coordinates as [number, number])
                setSelectedLibraryId(library.id)
                setOpenAccordionItem(`item-${library.id}`)
              }}
              className="border-b border-border"
            >
              <AccordionTrigger className="px-4 py-2 md:py-4 hover:bg-accent hover:text-accent-foreground font-light flex justify-between items-start no-chevron">
                <span className="text-left text-sm md:text-base">{library.name}</span>
                <span className="text-gray-500 text-xs md:text-sm ml-2 flex-shrink-0">
                  {calculateDistance(
                    userLocation ? userLocation[0] : BERLIN_CENTER[0],
                    userLocation ? userLocation[1] : BERLIN_CENTER[1],
                    library.coordinates[0],
                    library.coordinates[1]
                  ).toFixed(1)} km
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2 bg-card text-card-foreground">
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
