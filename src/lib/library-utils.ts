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

// Library colors — mixed across types for visual variety
const COLORS = ['#FF7050', '#FA8FD3', '#FEEE86', '#76C880', '#98B0FF', '#D3ADFF'] as const

const LIBRARY_COLORS: Record<number, string> = {
  1: '#D3ADFF', 2: '#FF7050', 3: '#FEEE86',
  4: '#98B0FF', 5: '#FA8FD3',
  6: '#76C880', 7: '#D3ADFF', 8: '#D3ADFF',
  9: '#FA8FD3', 12: '#FF7050', 13: '#98B0FF',
  14: '#76C880', 15: '#D3ADFF', 16: '#FA8FD3',
  17: '#FEEE86', 18: '#76C880', 20: '#FF7050',
  23: '#98B0FF', 25: '#FA8FD3', 26: '#D3ADFF',
  27: '#FEEE86', 28: '#76C880', 29: '#98B0FF',
  30: '#FF7050', 31: '#FA8FD3', 32: '#D3ADFF',
  33: '#76C880', 34: '#FEEE86', 36: '#98B0FF',
  37: '#FF7050', 38: '#FA8FD3', 39: '#D3ADFF',
  40: '#76C880', 41: '#FEEE86', 43: '#FF7050',
  44: '#98B0FF', 45: '#FA8FD3', 46: '#FEEE86',
  47: '#D3ADFF', 48: '#76C880', 49: '#FF7050',
  50: '#FA8FD3', 51: '#98B0FF', 52: '#FEEE86',
  53: '#D3ADFF', 54: '#76C880', 56: '#FF7050',
  57: '#FA8FD3', 58: '#98B0FF', 59: '#FEEE86',
  60: '#D3ADFF', 61: '#76C880', 62: '#FF7050',
  63: '#FA8FD3', 64: '#98B0FF',
}

export function getLibraryColor(id: number): string {
  return LIBRARY_COLORS[id] || COLORS[id % COLORS.length]
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
