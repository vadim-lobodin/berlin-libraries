import { describe, it, expect, vi, afterEach } from "vitest"
import {
  calculateDistance,
  getLibraryStatus,
  getStatusLabel,
  getLibraryColor,
  getLibraryColorLight,
  BERLIN_CENTER,
} from "./library-utils"

// Helper: working hours for a library open Mon-Fri 9-21, Sat 10-18, Sun closed
const standardHours = {
  monday: "9:00 - 21:00",
  tuesday: "9:00 - 21:00",
  wednesday: "9:00 - 21:00",
  thursday: "9:00 - 21:00",
  friday: "9:00 - 21:00",
  saturday: "10:00 - 18:00",
  sunday: "Closed",
}

function setFakeTime(dateStr: string) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(dateStr))
}

afterEach(() => {
  vi.useRealTimers()
})

// ─── calculateDistance ────────────────────────────────────────────────

describe("calculateDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(calculateDistance(52.52, 13.405, 52.52, 13.405)).toBe(0)
  })

  it("calculates distance between Berlin and Munich (~504 km)", () => {
    // Berlin: 52.52, 13.405 — Munich: 48.1351, 11.582
    const dist = calculateDistance(52.52, 13.405, 48.1351, 11.582)
    expect(dist).toBeGreaterThan(500)
    expect(dist).toBeLessThan(510)
  })

  it("calculates distance between Berlin and Hamburg (~255 km)", () => {
    const dist = calculateDistance(52.52, 13.405, 53.5511, 9.9937)
    expect(dist).toBeGreaterThan(250)
    expect(dist).toBeLessThan(260)
  })

  it("is symmetric (a->b same as b->a)", () => {
    const d1 = calculateDistance(52.52, 13.405, 48.1351, 11.582)
    const d2 = calculateDistance(48.1351, 11.582, 52.52, 13.405)
    expect(d1).toBeCloseTo(d2, 10)
  })

  it("handles equator crossing", () => {
    const dist = calculateDistance(1, 0, -1, 0)
    expect(dist).toBeGreaterThan(220)
    expect(dist).toBeLessThan(224)
  })
})

// ─── getLibraryStatus ────────────────────────────────────────────────

describe("getLibraryStatus", () => {
  it("returns 'Open' during regular hours", () => {
    // Wednesday at 14:00
    setFakeTime("2025-01-15T14:00:00")
    expect(getLibraryStatus(standardHours)).toBe("Open")
  })

  it("returns 'Closed' before opening", () => {
    // Wednesday at 07:00
    setFakeTime("2025-01-15T07:00:00")
    expect(getLibraryStatus(standardHours)).toBe("Closed")
  })

  it("returns 'Closed' after closing", () => {
    // Wednesday at 22:00
    setFakeTime("2025-01-15T22:00:00")
    expect(getLibraryStatus(standardHours)).toBe("Closed")
  })

  it("returns 'Closed' on a day marked Closed", () => {
    // Sunday
    setFakeTime("2025-01-19T14:00:00")
    expect(getLibraryStatus(standardHours)).toBe("Closed")
  })

  it("returns 'Closes Soon' within 1 hour before closing", () => {
    // Wednesday at 20:30 (closes at 21:00)
    setFakeTime("2025-01-15T20:30:00")
    expect(getLibraryStatus(standardHours)).toBe("Closes Soon")
  })

  it("returns 'Opens Soon' within 1 hour before opening", () => {
    // Wednesday at 08:30 (opens at 9:00)
    setFakeTime("2025-01-15T08:30:00")
    expect(getLibraryStatus(standardHours)).toBe("Opens Soon")
  })

  it("returns 'Open' right at opening time", () => {
    // Wednesday at 09:00 exactly
    setFakeTime("2025-01-15T09:00:00")
    expect(getLibraryStatus(standardHours)).toBe("Open")
  })

  it("handles Saturday hours correctly", () => {
    // Saturday at 12:00 (opens 10, closes 18)
    setFakeTime("2025-01-18T12:00:00")
    expect(getLibraryStatus(standardHours)).toBe("Open")
  })

  it("returns 'Closes Soon' within last hour on Saturday", () => {
    // Saturday at 17:15 (closes at 18:00)
    setFakeTime("2025-01-18T17:15:00")
    expect(getLibraryStatus(standardHours)).toBe("Closes Soon")
  })
})

// ─── getStatusLabel ──────────────────────────────────────────────────

describe("getStatusLabel", () => {
  it("shows open with closing time during regular hours", () => {
    // Wednesday at 14:00
    setFakeTime("2025-01-15T14:00:00")
    expect(getStatusLabel(standardHours)).toBe("Open, Closes 9pm")
  })

  it("shows open with closing time when closing soon", () => {
    // Wednesday at 20:30
    setFakeTime("2025-01-15T20:30:00")
    expect(getStatusLabel(standardHours)).toBe("Open, Closes 9pm")
  })

  it("shows 'Opens Soon' with time when about to open", () => {
    // Wednesday at 08:30
    setFakeTime("2025-01-15T08:30:00")
    expect(getStatusLabel(standardHours)).toBe("Opens Soon, 9am")
  })

  it("shows closed with today's opening time if before hours", () => {
    // Wednesday at 07:00
    setFakeTime("2025-01-15T07:00:00")
    expect(getStatusLabel(standardHours)).toBe("Closed, Opens 9am")
  })

  it("shows closed with next day info after hours", () => {
    // Wednesday at 22:00 — next open is Thursday 9am
    setFakeTime("2025-01-15T22:00:00")
    expect(getStatusLabel(standardHours)).toBe("Closed, Opens Thu 9am")
  })

  it("shows next weekday when closed on Sunday", () => {
    // Sunday at 14:00 — next open is Monday 9am
    setFakeTime("2025-01-19T14:00:00")
    expect(getStatusLabel(standardHours)).toBe("Closed, Opens Mon 9am")
  })

  it("shows Saturday hours on Friday evening", () => {
    // Friday at 22:00 — next open is Saturday 10am
    setFakeTime("2025-01-17T22:00:00")
    expect(getStatusLabel(standardHours)).toBe("Closed, Opens Sat 10am")
  })

  it("returns 'Closed' when all days are closed", () => {
    const allClosed = {
      monday: "Closed",
      tuesday: "Closed",
      wednesday: "Closed",
      thursday: "Closed",
      friday: "Closed",
      saturday: "Closed",
      sunday: "Closed",
    }
    setFakeTime("2025-01-15T14:00:00")
    expect(getStatusLabel(allClosed)).toBe("Closed")
  })
})

// ─── getLibraryColor ─────────────────────────────────────────────────

describe("getLibraryColor", () => {
  it("returns mapped color for known IDs", () => {
    expect(getLibraryColor(1)).toBe("#D3ADFF")
    expect(getLibraryColor(2)).toBe("#FF7050")
    expect(getLibraryColor(5)).toBe("#FA8FD3")
  })

  it("returns fallback color for unmapped IDs", () => {
    const color = getLibraryColor(999)
    expect(color).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it("returns consistent results for the same ID", () => {
    expect(getLibraryColor(42)).toBe(getLibraryColor(42))
  })
})

// ─── getLibraryColorLight ────────────────────────────────────────────

describe("getLibraryColorLight", () => {
  it("returns a lighter version as rgb string", () => {
    const light = getLibraryColorLight(1)
    expect(light).toMatch(/^rgb\(\d+, \d+, \d+\)$/)
  })

  it("produces values closer to 255 (lighter)", () => {
    const light = getLibraryColorLight(2) // #FF7050
    const match = light.match(/rgb\((\d+), (\d+), (\d+)\)/)!
    const [, r, g, b] = match.map(Number)
    // Each channel should be at least 204 (0.8 * 255) since formula blends toward white
    expect(r).toBeGreaterThanOrEqual(204)
    expect(g).toBeGreaterThanOrEqual(204)
    expect(b).toBeGreaterThanOrEqual(204)
  })
})

// ─── BERLIN_CENTER ───────────────────────────────────────────────────

describe("BERLIN_CENTER", () => {
  it("is a tuple of [lng, lat] near Berlin", () => {
    const [lng, lat] = BERLIN_CENTER
    expect(lng).toBeCloseTo(13.405, 1)
    expect(lat).toBeCloseTo(52.52, 1)
  })
})
