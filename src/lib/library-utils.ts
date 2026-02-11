import { format, parse, isWithinInterval, subHours, addDays } from "date-fns"

// Berlin center coordinates [lng, lat] (Mapbox format)
export const BERLIN_CENTER: [number, number] = [13.404954, 52.520008]

export type LibraryStatus = "Open" | "Closed" | "Opens Soon" | "Closes Soon"

export function getLibraryStatus(workingHours: {
  [key: string]: string
}): LibraryStatus {
  const now = new Date()
  const dayOfWeek = format(now, "EEEE").toLowerCase()

  const todayHours = workingHours[dayOfWeek]
  if (todayHours === "Closed") return "Closed"

  const [openTime, closeTime] = todayHours.split(" - ")
  const openDateTime = parse(openTime, "HH:mm", now)
  const closeDateTime = parse(closeTime, "HH:mm", now)

  if (isWithinInterval(now, { start: openDateTime, end: closeDateTime })) {
    if (
      isWithinInterval(now, {
        start: subHours(closeDateTime, 1),
        end: closeDateTime,
      })
    ) {
      return "Closes Soon"
    }
    return "Open"
  }

  if (
    isWithinInterval(now, {
      start: subHours(openDateTime, 1),
      end: openDateTime,
    })
  ) {
    return "Opens Soon"
  }

  return "Closed"
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

function fmtTime(t: string): string {
  const padded = t.includes(":") ? t.padStart(5, "0") : t
  if (t === "24:00") return "midnight"
  const parsed = parse(padded, "HH:mm", new Date())
  return format(parsed, "ha").toLowerCase()
}

export function getStatusLabel(workingHours: {
  [key: string]: string
}): string {
  const status = getLibraryStatus(workingHours)
  const now = new Date()
  const dayOfWeek = format(now, "EEEE").toLowerCase()
  const todayHours = workingHours[dayOfWeek]

  if (status === "Open" || status === "Closes Soon") {
    const closeTime = todayHours.split(" - ")[1]
    return `Open, Closes ${fmtTime(closeTime)}`
  }

  // Closed or Opens Soon — find next opening
  const todayIdx = DAYS.indexOf(dayOfWeek as typeof DAYS[number])

  // Check if today still has an opening ahead
  if (todayHours !== "Closed") {
    const openTime = todayHours.split(" - ")[0]
    const padded = openTime.includes(":") ? openTime.padStart(5, "0") : openTime
    const openDateTime = parse(padded, "HH:mm", now)
    if (now < openDateTime) {
      if (status === "Opens Soon") {
        return `Opens Soon, ${fmtTime(openTime)}`
      }
      return `Closed, Opens ${fmtTime(openTime)}`
    }
  }

  // Look at upcoming days
  for (let i = 1; i <= 7; i++) {
    const nextDay = DAYS[(todayIdx + i) % 7]
    const hours = workingHours[nextDay]
    if (hours !== "Closed") {
      const openTime = hours.split(" - ")[0]
      const nextDate = addDays(now, i)
      const dayLabel = format(nextDate, "EEE")
      return `Closed, Opens ${dayLabel} ${fmtTime(openTime)}`
    }
  }

  return "Closed"
}

// Library color by type
const LIBRARY_COLORS: Record<number, string> = {
  // Flagship (orange) — major state/central libraries
  1: '#FF722D', 2: '#FF722D', 3: '#FF722D',
  // Academic (yellow) — university libraries
  4: '#FEED6B', 5: '#FEED6B',
  // Cultural (pink) — special institution / museum libraries
  60: '#FA8FD3', 61: '#FA8FD3', 62: '#FA8FD3', 63: '#FA8FD3', 64: '#FA8FD3',
  // District hub (green) — larger district central libraries
  6: '#76C880', 7: '#76C880', 9: '#76C880', 14: '#76C880', 29: '#76C880',
  33: '#76C880', 37: '#76C880', 41: '#76C880', 44: '#76C880', 46: '#76C880',
  52: '#76C880', 56: '#76C880',
  // Neighborhood (purple) — Pankow/Prenzlauer cluster
  8: '#C69EF4', 15: '#C69EF4', 16: '#C69EF4', 23: '#C69EF4', 25: '#C69EF4',
}

export function getLibraryColor(id: number): string {
  return LIBRARY_COLORS[id] || '#A7C0E9' // default: blue (small neighborhood)
}

export function getLibraryColorLight(id: number): string {
  const hex = getLibraryColor(id).replace('#', '')
  const r = Math.round(parseInt(hex.substring(0, 2), 16) * 0.2 + 255 * 0.8)
  const g = Math.round(parseInt(hex.substring(2, 4), 16) * 0.2 + 255 * 0.8)
  const b = Math.round(parseInt(hex.substring(4, 6), 16) * 0.2 + 255 * 0.8)
  return `rgb(${r}, ${g}, ${b})`
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
