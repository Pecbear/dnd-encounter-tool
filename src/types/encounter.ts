export type EncounterPreviewUnit = {
  id: string
  name: string
  initiative: number
  dex: number
  side: 'hero' | 'enemy'
  maxHp: number
  currentHp: number
  ac: number
  statuses: string[]
}