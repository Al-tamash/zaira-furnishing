/**
 * Sofa Fabrics & Upholstery Structured Data
 * Architectural reference model matching Curtains & Window Blinds structure.
 */

export interface SofaFabricType {
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

// ─── THE 8 OFFICIAL SOFA FABRIC TYPES ───
export const SOFA_FABRIC_TYPES: SofaFabricType[] = [
  {
    id: 'type-sofa-boucle',
    slug: 'boucle',
    productSlug: 'roma-textured-boucle-upholstery',
    name: 'Bouclé',
    subtitle: 'Tactile Sculptured Loop & Nubby Textured Weaves',
    description: 'Luxurious looped yarn textiles delivering dimensional softness, high Martindale abrasion resistance, and organic modern warmth for curved sofas and statement lounge pieces.',
    image: '/images/hero/sofa_fabrics.jpg',
    badge: 'Tactile Couture',
    highlights: ['65,000+ Martindale rating', 'Nanocoated stain resistance', 'Deep textural depth'],
  },
  {
    id: 'type-sofa-velvet-chenille',
    slug: 'velvet-chenille',
    productSlug: 'monaco-crush-resistant-matte-velvet',
    name: 'Velvet & Chenille',
    subtitle: 'Plush Dense-Pile Lustre & Velvety Softness',
    description: 'Sumptuous, dense-pile upholstery velvets and tufted chenilles combining opulent light reflection with heavy-domestic wear resistance for living room seating.',
    image: '/images/sofa-fabrics/velvet-chenille.jpg',
    badge: 'Plush Lustre',
    highlights: ['Crush-resistant pile', 'Rich jewel & neutral tones', 'Ultra-soft handfeel'],
  },
  {
    id: 'type-sofa-performance',
    slug: 'performance',
    productSlug: 'aquaguard-performance-stain-shield-fabric',
    name: 'Performance & Stain-Resistant',
    subtitle: 'Engineered Stain-Shield & High-Traffic Durability',
    description: 'Advanced moisture-barrier and liquid-repellent fabrics engineered for busy family homes, pets, and commercial lounges without sacrificing soft aesthetic drape.',
    image: '/images/sofa-fabrics/performance.jpg',
    badge: 'Stain Shield',
    highlights: ['Easy water-cleanable', 'Pet & snag resistant', '100,000+ Martindale cycles'],
  },
  {
    id: 'type-sofa-linen-cotton',
    slug: 'linen-cotton',
    productSlug: 'florence-washed-belgian-linen-upholstery',
    name: 'Linen & Cotton Blends',
    subtitle: 'Breathable Natural Fibres with Relaxed Elegance',
    description: 'Pure washed linen and combed cotton blends that offer relaxed sophistication, natural breathability, and timeless organic character for tailored slipcovers and cushioned frames.',
    image: '/images/sofa-fabrics/linen-cotton.jpg',
    badge: 'Pure Natural',
    highlights: ['Natural breathability', 'Enzyme washed softness', 'Classic tailored drape'],
  },
  {
    id: 'type-sofa-textured-weave',
    slug: 'textured-weave',
    productSlug: 'nordic-architectural-tweed-upholstery',
    name: 'Textured Weave & Tweed',
    subtitle: 'Multi-Tonal Architectural Yarns & Tailored Tweeds',
    description: 'Structured multi-tonal weaves, melange yarns, and tailored tweeds designed to camouflage everyday wear while adding bespoke tailored depth to modern sectional sofas.',
    image: '/images/sofa-fabrics/textured-weave.jpg',
    badge: 'Multi-Tonal',
    highlights: ['Multi-yarn depth', 'Excellent shape retention', 'High snag resistance'],
  },
  {
    id: 'type-sofa-leatherette',
    slug: 'leatherette',
    productSlug: 'milano-vegan-grain-leatherette',
    name: 'Leatherette & Faux Leather',
    subtitle: 'Supple PU & Vegan Grain Leather Upholstery',
    description: 'Breathable premium polyurethane and vegan grain leather alternatives providing authentic leather grain appeal, wipe-clean convenience, and crack-resistant longevity.',
    image: '/images/sofa-fabrics/leatherette.jpg',
    badge: 'Wipe-Clean PU',
    highlights: ['Zero animal leather', 'Quick wipe maintenance', 'Supple micro-pore grain'],
  },
  {
    id: 'type-sofa-jacquard-upholstery',
    slug: 'jacquard-upholstery',
    productSlug: 'venetian-heritage-damask-jacquard',
    name: 'Jacquard & Damask Upholstery',
    subtitle: 'Intricate Woven Motifs & Classical Heritage Patterns',
    description: 'Heritage-inspired loom-woven damasks, brocades, and geometric relief jacquards tailored for heritage settees, accent armchairs, and ornate statement upholstery.',
    image: '/images/sofa-fabrics/jacquard-upholstery.jpg',
    badge: 'Heritage Loom',
    highlights: ['Loom-woven motifs', 'Subtle metallic highlights', 'Heavy structural stability'],
  },
  {
    id: 'type-sofa-outdoor-upholstery',
    slug: 'outdoor-upholstery',
    productSlug: 'solarium-all-weather-waterproof-fabric',
    name: 'Outdoor & Waterproof Fabrics',
    subtitle: 'UV-Stabilized Weatherproof & Mould-Resistant Textiles',
    description: 'Solution-dyed acrylics and polyurethane-backed waterproof fabrics engineered to withstand harsh sunlight, monsoons, and mildew for patio loungers and garden daybeds.',
    image: '/images/sofa-fabrics/outdoor-upholstery.jpg',
    badge: 'All-Weather',
    highlights: ['UV fade guarantee', 'Hydrophobic water repelling', 'Anti-mildew treated'],
  },
];

/**
 * Resolves a sofa fabric type by its canonical slug or recognized alias.
 */
export function getSofaFabricTypeBySlug(slug: string): SofaFabricType | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'boucle-fabrics': 'boucle',
    'boucle-sofa': 'boucle',
    'velvet': 'velvet-chenille',
    'chenille': 'velvet-chenille',
    'velvets': 'velvet-chenille',
    'performance-fabrics': 'performance',
    'stain-resistant': 'performance',
    'linen': 'linen-cotton',
    'cotton': 'linen-cotton',
    'linen-cotton-blends': 'linen-cotton',
    'tweed': 'textured-weave',
    'textured': 'textured-weave',
    'leather': 'leatherette',
    'faux-leather': 'leatherette',
    'vegan-leather': 'leatherette',
    'jacquard': 'jacquard-upholstery',
    'damask': 'jacquard-upholstery',
    'outdoor': 'outdoor-upholstery',
    'waterproof': 'outdoor-upholstery',
  };
  const target = aliasMap[normalized] || normalized;
  return SOFA_FABRIC_TYPES.find((t) => t.slug === target);
}
