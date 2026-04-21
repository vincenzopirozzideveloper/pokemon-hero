export interface Pokemon {
  id: string
  name: string
  label: string
  blurb: string
  body: string
  image: string
  bg: string
  accent: string
}

// Order tuned so every adjacent pair is far apart on the color wheel
// (red -> emerald -> violet -> blue -> near-black) to maximize drama on swap.
export const POKEMON: Pokemon[] = [
  {
    id: 'charizard',
    name: 'CHARIZARD',
    label: 'FIRE LEGEND',
    blurb: 'Wings of living flame',
    body: 'Born from the crucible of volcanic peaks, Charizard carries the memory of every battle across its scarred wings. Its fire burns not with rage but with the quiet certainty of a creature that has already survived the impossible.',
    image: '/pokemon/charizard.png',
    bg: '#B91C1C',
    accent: '#FFB26B',
  },
  {
    id: 'lucario',
    name: 'LUCARIO',
    label: 'AURA GUARDIAN',
    blurb: 'Steel and spirit in silence',
    body: 'Lucario reads the aura of every living creature like a language older than speech, feeling the flicker of courage and fear long before either is spoken aloud. It fights not for glory but because protecting the vulnerable is the only logic it knows.',
    image: '/pokemon/lucario.png',
    bg: '#064E3B',
    accent: '#6EE7B7',
  },
  {
    id: 'mewtwo',
    name: 'MEWTWO',
    label: 'PSYCHIC TITAN',
    blurb: 'Consciousness without origin',
    body: 'Engineered in silence and born into grief, Mewtwo perceives the lattice of thought that binds every living thing. It does not hate humanity — it simply understands it with a clarity that nothing else can bear.',
    image: '/pokemon/mewtwo.png',
    bg: '#5B21B6',
    accent: '#DDD6FE',
  },
  {
    id: 'rayquaza',
    name: 'RAYQUAZA',
    label: 'SKY DRAGON',
    blurb: 'Sovereign of the ozone layer',
    body: 'Rayquaza has patrolled the boundary between sky and space since before the first continent broke the ocean surface, feeding on stardust and cosmic winds. When it descends, meteorologists call it a storm; poets call it a judgment.',
    image: '/pokemon/rayquaza.png',
    bg: '#1E3A8A',
    accent: '#93C5FD',
  },
  {
    id: 'gengar',
    name: 'GENGAR',
    label: 'GHOST PHANTOM',
    blurb: 'Shadow that smiles back',
    body: 'Gengar slips between dimensions the way a thought slips between sleeping and waking — unbidden, inevitable, gone before you can be certain it was ever there. The cold at your shoulder is its only introduction.',
    image: '/pokemon/gengar.png',
    bg: '#0F0F14',
    accent: '#A78BFA',
  },
]
