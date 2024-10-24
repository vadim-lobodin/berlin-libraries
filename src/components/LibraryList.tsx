"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import libraries from "@/data/libraries.json"
import { Library } from "@/types/library"
import LogoSVG from "@/media/logotype.svg"
import Image from "next/image"
import Indicator from './Indicator'

// Function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Berlin center coordinates
const BERLIN_CENTER: [number, number] = [52.520008, 13.404954];

export default function LibraryList({ setLibraryCoordinates }: { setLibraryCoordinates: (coordinates: [number, number]) => void }) {
  const [hoveredLibrary, setHoveredLibrary] = useState<number | null>(null)
  const [sortedLibraries, setSortedLibraries] = useState<Library[]>([])

  useEffect(() => {
    const sorted = [...libraries].sort((a, b) => {
      const distA = calculateDistance(BERLIN_CENTER[0], BERLIN_CENTER[1], a.coordinates[1], a.coordinates[0]);
      const distB = calculateDistance(BERLIN_CENTER[0], BERLIN_CENTER[1], b.coordinates[1], b.coordinates[0]);
      return distA - distB; // Sort in ascending order
    });
    setSortedLibraries(sorted as Library[]); // Ensure this is treated as a Library[]
  }, []);

  return (
    <div className="w-full h-full bg-background/80 text-foreground overflow-y-auto flex flex-col">
      <div className="p-4 hidden md:block">
        <Image 
          src={LogoSVG} 
          alt="Logo" 
          width={140}
          height={46}
        />
      </div>
      <div className="mt-2 flex-grow overflow-y-auto">
        <Accordion type="single" collapsible className="w-full">
          {sortedLibraries.map((library: Library) => (
            <AccordionItem
              key={library.id}
              value={`item-${library.id}`}
              onMouseEnter={() => setHoveredLibrary(library.id)}
              onMouseLeave={() => setHoveredLibrary(null)}
              onClick={() => setLibraryCoordinates(library.coordinates as [number, number])}
              className="border-b border-border"
            >
              <AccordionTrigger className="px-4 py-2 md:py-4 hover:bg-accent hover:text-accent-foreground font-light flex justify-between items-start no-chevron">
                <span className="text-left text-sm md:text-base">{library.name}</span>
                <span className="text-gray-500 text-xs md:text-sm ml-2 flex-shrink-0">
                  {calculateDistance(BERLIN_CENTER[0], BERLIN_CENTER[1], library.coordinates[1], library.coordinates[0]).toFixed(1)} km
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2 bg-card text-card-foreground">
                <div className="flex flex-wrap">
                  <div className="w-1/2 pr-2">
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Address:</h3>
                    <p className="mb-4">{library.address}</p>
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Conference Areas:</h3>
                    <p className="mb-4">{library.conferenceAreas}</p>
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Cafe:</h3>
                    <p className="mb-4">{library.cafe}</p>
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Food Options Nearby:</h3>
                    <p className="mb-4">{library.foodOptionsNearby}</p>
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Lockers:</h3>
                    <p className="mb-4">{library.lockers}</p>
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Meeting Rooms:</h3>
                    <p className="mb-4">{library.meetingRooms}</p>
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Phone Call Policy:</h3>
                    <p className="mb-4">{library.phoneCallPolicy}</p>
                  </div>
                  <div className="w-1/2 pl-2">
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Workspace Setup:</h3>
                    <Indicator value={library.workspaceSetup} max={5} />
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Power Outlets:</h3>
                    <Indicator value={library.powerOutlets} max={5} />
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Ventilation:</h3>
                    <Indicator value={library.ventilation} max={5} />
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Wifi Quality:</h3>
                    <Indicator value={library.wifiQuality} max={5} />
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Atmosphere:</h3>
                    <Indicator value={library.professionalAtmosphere} max={5} />
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Cell Reception:</h3>
                    <Indicator value={library.cellReception} max={5} />
                    <h3 className="font-normal text-gray-400 mt-4 leading-relaxed">Working Hours:</h3>
                    <ul className="mb-4">
                      {Object.entries(library.workingHours).map(([day, hours]) => (
                        <li key={day} className="capitalize">
                          {day}: {hours}
                        </li>
                      ))}
                    </ul>
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
