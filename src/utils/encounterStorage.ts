const KEY = 'active_encounter_v1'

export function saveEncounter(data: any) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function loadEncounter() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearEncounter() {
  localStorage.removeItem(KEY)
}