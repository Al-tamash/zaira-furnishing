/**
 * Curtains & Drapes Structured Data
 * Future-proof backend ready structure for Zaira Furnishing
 */

export interface CurtainType {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  badge?: string;
  productSlug: string;
  highlights: string[];
}

export interface CurtainStyle {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
  idealFor: string;
}

export interface WindowTreatmentStyle {
  id: string;
  name: string;
  slug: string;
  origin: string;
  description: string;
  image: string;
}

export interface CurtainColorInspiration {
  id: string;
  name: string;
  slug: string;
  hex: string;
  secondaryHex?: string;
  toneDescription: string;
  vibe: string;
  image: string;
}

export interface CurtainHardwareItem {
  id: string;
  name: string;
  slug: string;
  category: 'rod' | 'track' | 'finial' | 'accessory';
  description: string;
  material: string;
  image: string;
}

// ─── 1. ALL 10 CURTAIN TYPES ───
export const CURTAIN_TYPES: CurtainType[] = [
  {
    id: 'type-blackout',
    slug: 'blackout',
    productSlug: 'blackout-curtains',
    name: 'Blackout Curtains',
    subtitle: '100% Light Exclusion & Acoustic Barrier',
    description: 'Explore our collection of premium blackout curtains designed for privacy, light control and comfortable interiors.',
    image: '/images/products/curtains/blackout-curtains/main.jpg',
    badge: '100% Blockout',
    highlights: ['Thermal barrier', 'Acoustic dampening', 'Restful sleep'],
  },
  {
    id: 'type-sheer',
    slug: 'sheer',
    productSlug: 'sheer-day-curtains',
    name: 'Sheer / Day Curtains',
    subtitle: 'Translucent Light-Filtering Voiles',
    description: 'Explore our collection of light-filtering sheer drapes designed for soft daylight diffusion and privacy.',
    image: '/images/products/curtains/sheer-day-curtains/main.jpg',
    badge: 'Daytime Privacy',
    highlights: ['Natural sunlight', 'Belgian voile', 'Graceful drape'],
  },
  {
    id: 'type-velvet',
    slug: 'velvet',
    productSlug: 'velvet-curtains',
    name: 'Velvet Curtains',
    subtitle: 'Opulent Heavyweight Texture',
    description: 'Explore our collection of luxury heavyweight velvet curtains offering rich texture, thermal body and acoustic dampening.',
    image: '/images/products/curtains/velvet-curtains/main.jpg',
    badge: 'Luxury Matte Pile',
    highlights: ['Sound absorbing', 'Insulating body', 'Opulent finish'],
  },
  {
    id: 'type-satin',
    slug: 'satin',
    productSlug: 'satin-plain-curtains',
    name: 'Satin Plain Curtains',
    subtitle: 'Subtle Silken Radiance & Flow',
    description: 'Explore our collection of smooth, silky lustrous satin plain curtains tailored for formal and contemporary interiors.',
    image: '/images/products/curtains/satin-plain-curtains/main.jpg',
    badge: 'Fluid Cascading',
    highlights: ['Lustrous drape', 'High-density weave', 'Corner weighted'],
  },
  {
    id: 'type-jacquard',
    slug: 'jacquard',
    productSlug: 'jacquard-curtains',
    name: 'Jacquard Curtains',
    subtitle: 'Intricately Woven Dimensional Relief',
    description: 'Explore our collection of intricately woven jacquard and damask curtains providing rich classical and modern texture.',
    image: '/images/products/curtains/jacquard-curtains/main.jpg',
    badge: 'Woven Damask',
    highlights: ['Yarn-dyed', 'Fade resistant', 'Architectural body'],
  },
  {
    id: 'type-linen',
    slug: 'linen',
    productSlug: 'linen-textured-curtains',
    name: 'Linen & Textured Curtains',
    subtitle: 'European Flax Slub & Breathability',
    description: 'Explore our collection of natural European flax linen and organic textured curtains crafted for relaxed modern elegance.',
    image: '/images/products/curtains/linen-textured-curtains/main.jpg',
    badge: '100% Natural Flax',
    highlights: ['Organic texture', 'Breathable weave', 'Relaxed luxury'],
  },
  {
    id: 'type-printed',
    slug: 'printed',
    productSlug: 'digitally-printed-curtains',
    name: 'Digitally Printed Curtains',
    subtitle: 'High-Definition Botanical & Modern Art',
    description: 'Explore our collection of high-definition digitally printed botanical, geometric and contemporary artistic curtains.',
    image: '/images/products/curtains/digitally-printed-curtains/main.jpg',
    badge: 'Colorfast Reactive',
    highlights: ['UV stabilized', 'Artisan prints', 'Vibrant detail'],
  },
  {
    id: 'type-embroidered',
    slug: 'embroidered',
    productSlug: 'embroidered-curtains',
    name: 'Embroidered Curtains',
    subtitle: 'Intricate Artisanal Threadwork',
    description: 'Explore our collection of fine threadwork and embroidered luxury curtains for grand, artisanal spaces.',
    image: '/images/products/curtains/embroidered-curtains/main.jpg',
    badge: 'Hand Threadwork',
    highlights: ['Chantilly borders', 'Raw silk ground', 'Heritage detail'],
  },
  {
    id: 'type-kids',
    slug: 'kids',
    productSlug: 'kids-room-curtains',
    name: 'Kids Room Curtains',
    subtitle: 'Hypoallergenic & Playful Themes',
    description: 'Explore our collection of playful, hypoallergenic and washable curtains tailored for children\'s rooms and nurseries.',
    image: '/images/products/curtains/kids-room-curtains/main.jpg',
    badge: 'OEKO-TEX Certified',
    highlights: ['Non-toxic dyes', 'Nap-time blackout', 'Washable fabric'],
  },
  {
    id: 'type-custom',
    slug: 'custom',
    productSlug: 'customized-made-to-measure-curtains',
    name: 'Customized / Made-to-Measure',
    subtitle: 'Laser Measured & Tailored Atelier',
    description: 'Explore our bespoke atelier curtain service, customized to exact millimeter dimensions and your fabric choice.',
    image: '/images/products/curtains/custom-made-curtains/main.jpg',
    badge: 'Bespoke Atelier',
    highlights: ['Millimeter sizing', 'Doorstep swatches', 'Professional hang'],
  },
];

export function getCurtainTypeBySlug(slug: string): CurtainType | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'sheer-day': 'sheer',
    'satin-plain': 'satin',
    'linen-textured': 'linen',
    'digitally-printed': 'printed',
    'kids-room': 'kids',
    'custom-made': 'custom',
    'customized': 'custom',
    'customized-made-to-measure': 'custom',
  };
  const target = aliasMap[normalized] || normalized;
  return CURTAIN_TYPES.find((t) => t.slug === target);
}

// ─── 2. CURTAIN STITCHING / HANGING STYLES ───
export const CURTAIN_STYLES: CurtainStyle[] = [
  {
    id: 'style-eyelet',
    name: 'Eyelet / Rings',
    slug: 'eyelet-rings',
    subtitle: 'Modern Clean Waves',
    description: 'Metal grommets fitted directly through the fabric top, creating deep, uniform folds that slide smoothly across curtain poles.',
    image: '/images/products/curtains/linen-textured-curtains/main.jpg',
    idealFor: 'Casual living rooms, contemporary bedrooms & pole installations',
  },
  {
    id: 'style-pinch-pleat',
    name: 'Pinch Pleat',
    slug: 'pinch-pleat',
    subtitle: 'Classic French Elegance',
    description: 'Tightly grouped double or triple pleats sewn into the fabric header for a formal, architectural, and tailored drape.',
    image: '/images/products/curtains/blackout-curtains/main.jpg',
    idealFor: 'Formal living spaces, master bedrooms & high-ceiling windows',
  },
  {
    id: 'style-american-pleat',
    name: 'American Pleat',
    slug: 'american-pleat',
    subtitle: 'Structured Architectural Lines',
    description: 'Crisp vertical fold pleating stitched with defined back-hooks, offering crisp stacking and structured balance.',
    image: '/images/products/curtains/velvet-curtains/main.jpg',
    idealFor: 'Transitional interiors and modern luxury residences',
  },
  {
    id: 'style-ripple-fold',
    name: 'Ripple Fold / S-Fold Wave',
    slug: 'ripple-fold-wave',
    subtitle: 'Continuous Fluid S-Waves',
    description: 'Specially engineered continuous wave heading that maintains gentle, uniform S-curves whether open or fully drawn closed.',
    image: '/images/products/curtains/sheer-day-curtains/main.jpg',
    idealFor: 'Ceiling-to-floor glass walls, motorized tracks & modern apartments',
  },
  {
    id: 'style-goblet',
    name: 'Goblet',
    slug: 'goblet',
    subtitle: 'Stately Cylindrical Crown',
    description: 'Pleats sculpted into distinctive wineglass cup shapes stuffed with wadding for permanent grand cylindrical definition.',
    image: '/images/products/curtains/jacquard-curtains/main.jpg',
    idealFor: 'Heritage estates, dining halls & grand drawing rooms',
  },
  {
    id: 'style-rod-pocket',
    name: 'Rod Pocket',
    slug: 'rod-pocket',
    subtitle: 'Soft Gathering & Ruffled Top',
    description: 'Fabric casing sewn across the top allows the rod to slip directly through, generating a charming gathered header.',
    image: '/images/products/curtains/satin-plain-curtains/main.jpg',
    idealFor: 'Sheer window panels, cafe treatments & secondary bedrooms',
  },
];

// ─── 3. WINDOW TREATMENT STYLES ───
export const WINDOW_TREATMENT_STYLES: WindowTreatmentStyle[] = [
  {
    id: 'treat-french',
    name: 'French Pleat Drapery',
    slug: 'french-pleat',
    origin: 'Classical European Architecture',
    description: 'Refined triple-pinch headings paired with full-length cotton sateen lining, creating majestic volume.',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-italian',
    name: 'Italian Stringed Drapes',
    slug: 'italian-drapes',
    origin: 'Tuscan Villa Tradition',
    description: 'Curtains drawn up and outwards diagonally through hidden cord rings to frame scenic garden vistas.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-austrian',
    name: 'Austrian Festoon Shades',
    slug: 'austrian-shades',
    origin: 'Viennese Grandeur',
    description: 'Fabric gathered vertically in continuous scallops that rise like theatrical clouds when pulled.',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-roman',
    name: 'Tailored Roman Shades',
    slug: 'roman-shades',
    origin: 'Mediterranean Minimalism',
    description: 'Horizontal fabric panels that fold up smoothly in crisp accordion stacks with no fabric puddling.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-roller',
    name: 'Architectural Roller Blinds',
    slug: 'roller-blinds',
    origin: 'Contemporary Clean Lines',
    description: 'Minimalist fabric cassettes that roll tightly out of view, offering clean daytime solar protection.',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-vertical',
    name: 'Vertical Louver Blinds',
    slug: 'vertical-blinds',
    origin: 'Modernist Light Control',
    description: 'Slender vertical fabric slats that tilt 180 degrees for micro light adjustment along patio expanses.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-cafe',
    name: 'Bistro Cafe Style',
    slug: 'cafe-style',
    origin: 'French Countryside',
    description: 'Half-height curtains hung midway up the window, preserving eye-level light while shielding street views.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'treat-swag',
    name: 'Swag & Tail Valance',
    slug: 'swag-valance',
    origin: 'Baroque Stately Interiors',
    description: 'Dramatic soft semicircular draped fabric swags draped along top pelmets with cascading side cascades.',
    image: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80',
  },
];

// ─── 4. CURTAIN COLORS & FABRIC INSPIRATION ───
export const CURTAIN_COLORS: CurtainColorInspiration[] = [
  {
    id: 'col-warm-white',
    name: 'Warm White / Linen',
    slug: 'warm-white-linen',
    hex: '#F4EFEA',
    secondaryHex: '#E5DCD1',
    toneDescription: 'Soft airy ivory with subtle warm linen undertones',
    vibe: 'Sun-drenched, serene & universally versatile',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'col-greige',
    name: 'Greige',
    slug: 'greige',
    hex: '#C8BEB2',
    secondaryHex: '#ADA193',
    toneDescription: 'Sophisticated bridge between cool grey and organic beige',
    vibe: 'Contemporary minimalist & Scandinavian warmth',
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'col-sage',
    name: 'Sage Green',
    slug: 'sage-green',
    hex: '#8D9B87',
    secondaryHex: '#6F7F69',
    toneDescription: 'Biophilic muted eucalyptus and botanical sage green',
    vibe: 'Calming, nature-connected & restorative',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'col-taupe',
    name: 'Taupe',
    slug: 'taupe',
    hex: '#A59485',
    secondaryHex: '#8C7B6C',
    toneDescription: 'Earth-grounded velvety neutral with rich depth',
    vibe: 'Refined hotel-suite luxury & architectural stability',
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'col-charcoal',
    name: 'Charcoal Grey',
    slug: 'charcoal-grey',
    hex: '#3E4144',
    secondaryHex: '#26292C',
    toneDescription: 'Deep moody slate grey for theatrical contrast and dark rooms',
    vibe: 'Modern dramatic, bold & cinematic sanctuary',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'col-ivory-beige',
    name: 'Ivory + Beige',
    slug: 'ivory-beige',
    hex: '#ECE5D8',
    secondaryHex: '#D5C7B2',
    toneDescription: 'Luminous cream and toasted almond duo-tone harmony',
    vibe: 'Timeless transitional & quiet opulence',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'col-mocha',
    name: 'Mocha Brown',
    slug: 'mocha-brown',
    hex: '#5E483B',
    secondaryHex: '#45342A',
    toneDescription: 'Rich espresso and roasted cocoa velvet warmth',
    vibe: 'Cozy, grounded & opulent evening ambience',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
  },
];

// ─── 5. CURTAIN ACCESSORIES & HARDWARE ───
export const CURTAIN_HARDWARE: CurtainHardwareItem[] = [
  {
    id: 'hw-ss-rod',
    name: 'Stainless Steel Curtain Rods',
    slug: 'stainless-steel-rods',
    category: 'rod',
    description: 'Marine-grade 304 stainless steel rods in brushed satin and mirror polish finishes for sleek longevity.',
    material: 'Brushed / Polished Grade 304 Steel',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-brass-rod',
    name: 'Brass Curtain Rods',
    slug: 'brass-rods',
    category: 'rod',
    description: 'Solid brass poles treated with anti-tarnish lacquers in antique brass, aged bronze, and brushed champagne.',
    material: 'Solid Brass with Protective Clear Coat',
    image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-wood-rod',
    name: 'Wooden Curtain Rods',
    slug: 'wooden-rods',
    category: 'rod',
    description: 'Sustainably sourced kiln-dried oak and walnut fluted rods providing natural organic texture.',
    material: 'Natural Hardwood (Walnut / Oak)',
    image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-finials',
    name: 'Designer Finials',
    slug: 'designer-finials',
    category: 'finial',
    description: 'Architectural end caps sculpted in faceted crystal, geometric cubes, spun metal spheres, and carved motifs.',
    material: 'Precision Cast Metal & Cut Glass',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-motorized',
    name: 'Motorized Smart Tracks',
    slug: 'motorized-smart-tracks',
    category: 'track',
    description: 'Ultra-silent motorized curtain tracks with Tuya, Alexa, Google Home integration and schedule controls.',
    material: 'Heavy-Duty Aluminum Extrusion with Silent Belt',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-tracks',
    name: 'Curtain Tracks & Rails',
    slug: 'curtain-tracks',
    category: 'track',
    description: 'Slimline ceiling-mount and recessed pelmet tracks with smooth roller ball gliders for silent gliding.',
    material: 'Powder-Coated Anodized Aluminum',
    image: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-brackets',
    name: 'Heavy-Duty Brackets',
    slug: 'brackets',
    category: 'accessory',
    description: 'Precision wall and ceiling brackets designed for single and dual rod/track installations.',
    material: 'Reinforced Solid Cast Alloy',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hw-tiebacks',
    name: 'Handcrafted Tiebacks',
    slug: 'tiebacks',
    category: 'accessory',
    description: 'Luxurious silk tassel tiebacks, magnetic rope holdbacks, and architectural brass wall hooks.',
    material: 'Silk Cordage & Brushed Brass Hooks',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
  },
];
