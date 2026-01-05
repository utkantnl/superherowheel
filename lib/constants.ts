// Superhero allowlist - all heroes available on the wheel
export const SUPERHEROES = [
  'Spider-Man',
  'Iron Man',
  'Captain America',
  'Thor',
  'Hulk',
  'Black Panther',
  'Doctor Strange',
  'Wolverine',
  'Deadpool',
  'Black Widow',
  'Scarlet Witch',
  'Captain Marvel',
  'Ant-Man',
  'Vision',
  'Hawkeye',
  'Star-Lord',
] as const;

export type Superhero = (typeof SUPERHEROES)[number];

// Wheel segment colors - vibrant gradient pairs
export const WHEEL_COLORS = [
  { bg: '#FF6B6B', text: '#FFFFFF' }, // Coral Red
  { bg: '#4ECDC4', text: '#FFFFFF' }, // Teal
  { bg: '#45B7D1', text: '#FFFFFF' }, // Sky Blue
  { bg: '#96CEB4', text: '#1A1A2E' }, // Sage
  { bg: '#FFEAA7', text: '#1A1A2E' }, // Soft Yellow
  { bg: '#DDA0DD', text: '#1A1A2E' }, // Plum
  { bg: '#98D8C8', text: '#1A1A2E' }, // Mint
  { bg: '#F7DC6F', text: '#1A1A2E' }, // Gold
  { bg: '#BB8FCE', text: '#FFFFFF' }, // Lavender
  { bg: '#85C1E9', text: '#1A1A2E' }, // Light Blue
  { bg: '#F8B500', text: '#1A1A2E' }, // Amber
  { bg: '#FF8C94', text: '#FFFFFF' }, // Coral Pink
  { bg: '#91EAE4', text: '#1A1A2E' }, // Aqua
  { bg: '#FFD93D', text: '#1A1A2E' }, // Sunflower
  { bg: '#C9B1FF', text: '#1A1A2E' }, // Periwinkle
  { bg: '#6BCB77', text: '#FFFFFF' }, // Green
];

// Image validation
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Prompt template for generation
export const GENERATION_PROMPT_TEMPLATE = (hero: string) =>
  `Transform the uploaded person into ${hero}. Keep the person's identity and face recognizable. High quality, cinematic lighting, detailed costume, realistic. No nudity. No gore.`;
