"use client"

import { useState, useEffect, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import libraries from "../data/libraries.json"
import { Library } from "../types/library"
import LogoSVG from "../media/logotype.svg"
import Image from "next/image"
import Indicator from './Indicator'
import { getLibraryStatus, calculateDistance, BERLIN_CENTER } from "../lib/library-utils"

interface LibraryListProps {
  setLibraryCoordinates: (coordinates: [number, number]) => void
  setSelectedLibraryId: (id: number | null) => void
  userLocation: [number, number] | null
  openAccordionItem: string | null
  setOpenAccordionItem: (value: string | null) => void
}

interface SortedLibraryEntry {
  library: Library
  distance: number
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
  const [sortedLibraries, setSortedLibraries] = useState<SortedLibraryEntry[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const referencePoint = userLocation || BERLIN_CENTER;
    const withDistance = libraries.map(lib => ({
      library: lib as Library,
      distance: calculateDistance(referencePoint[1], referencePoint[0], lib.coordinates[1], lib.coordinates[0])
    }));
    withDistance.sort((a, b) => a.distance - b.distance);
    setSortedLibraries(withDistance);
  }, [userLocation]);

  // Scroll to the open accordion item after accordion animation completes
  useEffect(() => {
    if (!openAccordionItem || !containerRef.current) return

    // Wait for accordion animation (200ms) to finish before measuring
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const accordionItem = container.querySelector(`[data-value="${openAccordionItem}"]`);
      if (!accordionItem) return;

      const trigger = accordionItem.querySelector('[data-radix-collection-item]') ||
                     accordionItem.querySelector('button') ||
                     accordionItem.children[0];

      const target = trigger || accordionItem;
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Account for sticky logo header on desktop
      const stickyHeader = container.querySelector(':scope > .sticky');
      const stickyHeight = stickyHeader ? stickyHeader.getBoundingClientRect().height : 0;

      const scrollTarget = container.scrollTop + targetRect.top - containerRect.top - stickyHeight - 8;

      container.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [openAccordionItem]);

  return (
    <div ref={containerRef} className="w-full h-full bg-background/80 text-foreground overflow-y-auto scrollbar-hide">
      <div className="p-4 hidden md:block sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <Image
          src={LogoSVG}
          alt="Logo"
          width={140}
          height={46}
        />
      </div>
      <div>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openAccordionItem || undefined}
          onValueChange={setOpenAccordionItem}
        >
          {sortedLibraries.map(({ library, distance }) => (
            <AccordionItem
              key={library.id}
              value={`item-${library.id}`}
              data-value={`item-${library.id}`}
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
                  {distance.toFixed(1)} km
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
