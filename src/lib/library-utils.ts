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
const COLORS = ['#FF937B', '#FFAEE2', '#FFD391', '#8CE1BD', '#B3C5FF', '#DCBBFF'] as const

const LIBRARY_COLORS: Record<number, string> = {
  1: '#DCBBFF', 2: '#FF937B', 3: '#FFD391',
  4: '#B3C5FF', 5: '#FFAEE2',
  6: '#8CE1BD', 7: '#DCBBFF', 8: '#DCBBFF',
  9: '#FFAEE2', 12: '#FF937B', 13: '#B3C5FF',
  14: '#8CE1BD', 15: '#DCBBFF', 16: '#FFAEE2',
  17: '#FFD391', 18: '#8CE1BD', 20: '#FF937B',
  23: '#B3C5FF', 25: '#FFAEE2', 26: '#DCBBFF',
  27: '#FFD391', 28: '#8CE1BD', 29: '#B3C5FF',
  30: '#FF937B', 31: '#FFAEE2', 32: '#DCBBFF',
  33: '#8CE1BD', 34: '#FFD391', 36: '#B3C5FF',
  37: '#FF937B', 38: '#FFAEE2', 39: '#DCBBFF',
  40: '#8CE1BD', 41: '#FFD391', 43: '#FF937B',
  44: '#B3C5FF', 45: '#FFAEE2', 46: '#FFD391',
  47: '#DCBBFF', 48: '#8CE1BD', 49: '#FF937B',
  50: '#FFAEE2', 51: '#B3C5FF', 52: '#FFD391',
  53: '#DCBBFF', 54: '#8CE1BD', 56: '#FF937B',
  57: '#FFAEE2', 58: '#B3C5FF', 59: '#FFD391',
  60: '#DCBBFF', 61: '#8CE1BD',
  63: '#FFAEE2', 64: '#B3C5FF',
}

export function getLibraryColor(id: number): string {
  return LIBRARY_COLORS[id] || COLORS[id % COLORS.length]
}

const PIN_COLORS: Record<string, string> = {
  '#8CE1BD': '#14BC94',
  '#FFD391': '#FFC85B',
  '#FF937B': '#FF7151',
  '#B3C5FF': '#89A5FF',
  '#FFAEE2': '#FF80E4',
  '#DCBBFF': '#C695FF',
}

export function getLibraryPinColor(id: number): string {
  const bg = getLibraryColor(id)
  return PIN_COLORS[bg] || bg
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
