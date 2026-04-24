export type EncounterPreviewUnit = {
  id: string
  name: string
  initiative: number
  str: number;
  dex: number;  
  con: number;
  int: number;
  wis: number;
  cha: number;
  side: 'hero' | 'enemy'
  maxHp: number
  currentHp: number
  ac: number
  
  statuses: string[]
}