type MockEnemy = {
  number: number
  name: string
  maxHp: number
  ac: number
  dex: number
  xp: number
}

export const mockEnemies: MockEnemy[] = [
  {
    number: 1,
    name: 'Rat',
    maxHp: 8,
    ac: 12,
    dex: 14,
    xp: 25,
  },
  {
    number: 2,
    name: 'Bat',
    maxHp: 6,
    ac: 13,
    dex: 15,
    xp: 25,
  },
  {
    number: 3,
    name: 'Alien',
    maxHp: 20,
    ac: 14,
    dex: 12,
    xp: 100,
  },
  {
    number: 4,
    name: 'Cow',
    maxHp: 18,
    ac: 10,
    dex: 8,
    xp: 50,
  },
]