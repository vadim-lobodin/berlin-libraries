export interface Library {
  id: number
  name: string
  address: string
  workingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  coordinates: [number, number]
  workspaceSetup: number
  wifiQuality: number
  powerOutlets: number
  conferenceAreas: string
  cafe: string
  foodOptionsNearby: string
  lockers: string
  meetingRooms: string
  timeLimits: string
  phoneCallPolicy: string
  professionalAtmosphere: number
  ventilation: number
  cellReception: number
}
