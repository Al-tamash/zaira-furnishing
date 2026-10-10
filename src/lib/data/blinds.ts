/**
 * Window Blinds & Shades Structured Data
 * Architectural reference model matching Curtains & Drapes structure.
 */

export interface BlindType {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
  productSlug?: string;
  highlights?: string[];
  image?: string;
}

// ─── THE 9 OFFICIAL WINDOW BLIND TYPES ───
export const BLIND_TYPES: BlindType[] = [
  {
    id: 'type-blind-roller',
    slug: 'roller',
    productSlug: 'roller-blinds',
    name: 'Roller Blinds',
    subtitle: 'Minimalist Architectural Solar & Blackout Shades',
    description: 'Precision anti-glare screen textiles and 100% blockout fabrics engineered for crisp, minimal window profiles.',
    image: '/images/hero/blinds.jpg',
    badge: 'Solar & Blockout',
    highlights: ['Thermal reflection', 'Compact cassette', 'Motorized or chain'],
  },
  {
    id: 'type-blind-zebra',
    slug: 'zebra',
    productSlug: 'zebra-blinds',
    name: 'Zebra Blinds (Day & Night)',
    subtitle: 'Dual-Layer Alternating Sheer & Privacy Bands',
    description: 'Innovative dual-layer fabric bands that align smoothly for effortless transitions between soft daylight and full privacy.',
    image: '/images/blinds/zebra.jpg',
    badge: 'Day & Night',
    highlights: ['Dual-band control', 'Diffused daylight', 'Modern visual depth'],
  },
  {
    id: 'type-blind-roman',
    slug: 'roman',
    productSlug: 'roman-blinds',
    name: 'Roman Blinds / Shades',
    subtitle: 'Soft Structured Fabric Stacks with Tailored Folds',
    description: 'Warm textile window dressings that gather into luxurious, horizontal cascading pleats when raised.',
    image: '/images/blinds/roman.jpg',
    badge: 'Soft Tailored',
    highlights: ['Couture fabric body', 'Thermal underlay', 'Architectural stacking'],
  },
  {
    id: 'type-blind-wooden',
    slug: 'wooden',
    productSlug: 'wooden-blinds',
    name: 'Wooden Blinds',
    subtitle: 'Natural Hardwood & Basswood Slat Blinds',
    description: 'Authentic kiln-dried basswood slats crafted to bring organic warmth, grain depth, and light angling to fine interiors.',
    image: '/images/blinds/wooden.jpg',
    badge: 'Natural Hardwood',
    highlights: ['50mm basswood slats', 'UV protective coat', 'Decorative cloth tapes'],
  },
  {
    id: 'type-blind-venetian',
    slug: 'venetian',
    productSlug: 'venetian-blinds',
    name: 'Venetian Blinds',
    subtitle: 'Precision Aluminium Micro & Macro Slat Systems',
    description: 'Streamlined spring-tempered aluminium louvers providing calibrated directional light control and moisture resistance.',
    image: '/images/blinds/venetian.jpg',
    badge: 'Precision Slat',
    highlights: ['Anti-static aluminium', 'Moisture resistant', '360° tilt angle'],
  },
  {
    id: 'type-blind-vertical',
    slug: 'vertical',
    productSlug: 'lumina-architectural-vertical-blinds',
    name: 'Vertical Blinds',
    subtitle: 'Slender Fabric Louvers for Expansive Glass & Sliders',
    description: 'Vertical 89mm and 127mm vanes ideally suited for floor-to-ceiling glass expanses, patio sliders, and office enclosures.',
    image: '/images/blinds/vertical.jpg',
    badge: 'Large Openings',
    highlights: ['180° rotation', 'Easy wand control', 'Floor-to-ceiling scale'],
  },
  {
    id: 'type-blind-cellular',
    slug: 'cellular',
    productSlug: 'thermo-hex-cellular-honeycomb-shades',
    name: 'Honeycomb / Cellular Shades',
    subtitle: 'Engineered Hexagonal Air Pockets for Maximum Thermal Efficiency',
    description: 'Cellular air traps that form a superior barrier against outdoor heat and cold while softly diffusing illumination.',
    image: '/images/blinds/cellular.jpg',
    badge: 'High Energy Saving',
    highlights: ['Hexagonal insulation', 'Acoustic absorption', 'Ultra-slim stack'],
  },
  {
    id: 'type-blind-balcony-pvc',
    slug: 'balcony-pvc',
    productSlug: 'monsoon-shield-heavy-duty-pvc-blinds',
    name: 'Balcony / Monsoon PVC Blinds',
    subtitle: 'Heavy-Duty Weatherproof Exterior Shield Systems',
    description: 'UV-stabilized clear and tinted PVC roller barriers engineered to resist heavy monsoon downpours, wind, and outdoor dust.',
    image: '/images/blinds/balcony-pvc.jpg',
    badge: 'All-Weather Shield',
    highlights: ['Wind-lock cables', '100% waterproof', 'Preserves garden/sky view'],
  },
  {
    id: 'type-blind-motorized-smart',
    slug: 'motorized-smart',
    productSlug: 'somfy-automated-motorized-roller-shades',
    name: 'Motorized & Smart Blinds',
    subtitle: 'Automated Whisper-Quiet Motorization with Voice & App Control',
    description: 'Intelligent motorized systems seamlessly integrated with Somfy, Tuya, Apple HomeKit, Alexa, and Google Assistant.',
    image: '/images/blinds/motorized-smart.jpg',
    badge: 'Smart Automation',
    highlights: ['Ultra-silent motors', 'App & voice scenes', 'Battery or hardwired'],
  },
];

/**
 * Resolves a blind type by its canonical slug or recognized alias.
 */
export function getBlindTypeBySlug(slug: string): BlindType | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'roller-blinds': 'roller',
    'zebra-blinds': 'zebra',
    'roman-blinds': 'roman',
    'roman-shades': 'roman',
    'wooden-blinds': 'wooden',
    'wood': 'wooden',
    'venetian-blinds': 'venetian',
    'vertical-blinds': 'vertical',
    'honeycomb': 'cellular',
    'honeycomb-shades': 'cellular',
    'cellular-shades': 'cellular',
    'balcony-blinds': 'balcony-pvc',
    'monsoon-blinds': 'balcony-pvc',
    'pvc-blinds': 'balcony-pvc',
    'motorized': 'motorized-smart',
    'smart-blinds': 'motorized-smart',
    'motorized-blinds': 'motorized-smart',
  };
  const target = aliasMap[normalized] || normalized;
  return BLIND_TYPES.find((t) => t.slug === target);
}
