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
