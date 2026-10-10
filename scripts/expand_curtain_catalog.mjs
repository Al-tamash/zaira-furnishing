import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

console.log('Starting Curtain Catalog Expansion in D1 (data/zaira.db)...');

// Helper to run transaction
const runTransaction = () => {
  db.exec('BEGIN TRANSACTION;');

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // 1. UPDATE EXISTING PRODUCTS (prod-curt-2 to prod-curt-10)
    // ══════════════════════════════════════════════════════════════════════════

    const updates = [
      {
        id: 'prod-curt-2',
        name: 'Ivory Mist Light-Filtering Sheer Curtains',
        displayName: 'Ivory Mist Light-Filtering Sheer Curtains',
        slug: 'sheer-day-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 2450,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Spun from delicate European voile, our Ivory Mist Sheer Curtains softly diffuse natural daylight while preserving privacy.',
        desc: 'Spun from delicate European voile, our Ivory Mist Sheer Curtains softly filter harsh sunlight while preserving your privacy and outdoor views. Finished with weighted lead tape hems for graceful fluid ripples in modern and classical interiors alike.',
        spaceSlugs: '["living-room","bedroom","windows"]',
        images: [
          { id: 'img-curt-2-1', url: '/images/products/curtains/sheer-day-curtains/ivory-voile.jpg', alt: 'Ivory Mist Light-Filtering Sheer Curtains in Double-Height Living Room', isMain: 1, order: 0 },
          { id: 'img-curt-2-2', url: '/images/products/curtains/sheer-day-curtains/champagne-room.jpg', alt: 'Ivory Mist Sheer Curtains in Bedroom', isMain: 0, order: 1 },
          { id: 'img-curt-2-3', url: '/images/products/curtains/sheer-day-curtains/fabric-detail.jpg', alt: 'Ivory Voile Sheer Weave Texture Detail', isMain: 0, order: 2 },
          { id: 'img-curt-2-4', url: '/images/products/curtains/sheer-day-curtains/main.jpg', alt: 'Crisp Snow White Sheer Day Curtains Alternative View', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-sheer-1', name: 'Ivory Mist', type: 'color', sku: 'ZA-CURT-SHR-01', hex: '#FAF6F0', thumb: '/images/products/curtains/sheer-day-curtains/ivory-voile.jpg', prev: '/images/products/curtains/sheer-day-curtains/ivory-voile.jpg', adj: 0, attrs: '{"Opacity":"Semi-Sheer Light Filtering","Fabric":"Fine Spun Belgian Voile"}' },
          { id: 'var-sheer-2', name: 'Warm Champagne', type: 'color', sku: 'ZA-CURT-SHR-02', hex: '#F7F0E6', thumb: '/images/products/curtains/sheer-day-curtains/champagne-room.jpg', prev: '/images/products/curtains/sheer-day-curtains/champagne-room.jpg', adj: 0, attrs: '{"Opacity":"Semi-Sheer Light Filtering","Fabric":"Fine Spun Belgian Voile"}' },
          { id: 'var-sheer-3', name: 'Crisp Snow White', type: 'color', sku: 'ZA-CURT-SHR-03', hex: '#FFFFFF', thumb: '/images/products/curtains/sheer-day-curtains/main.jpg', prev: '/images/products/curtains/sheer-day-curtains/main.jpg', adj: 0, attrs: '{"Opacity":"Semi-Sheer Light Filtering","Fabric":"Fine Spun Belgian Voile"}' },
        ],
        specs: [
          { label: 'Material', value: '100% Fine Spun Voile & Flax Blend' },
          { label: 'Light Control', value: 'Soft Natural Daylight Diffusion with Daytime Privacy' },
          { label: 'Bottom Finish', value: 'Weighted Lead Tape Hem for Crisp Cascading Wave' },
          { label: 'Heading Styles', value: 'French Pinch Pleat, Wave Ripplefold, Rod Pocket' },
          { label: 'Measurement Support', value: 'Complimentary In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Gentle Machine Cold Wash or Hand Wash' },
        ]
      },
      {
        id: 'prod-curt-3',
        name: 'Royal Emerald Heavyweight Matte Velvet Drapes',
        displayName: 'Royal Emerald Heavyweight Matte Velvet Drapes',
        slug: 'velvet-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 4600,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Plush heavyweight cotton-rich matte velvet curtains with rich thermal insulation, acoustic dampening and dramatic drape.',
        desc: 'Woven with high-density cotton-rich velvet pile, these opulent emerald drapes deliver superior thermal insulation, sound dampening, and deep jewel-tone sophistication for grand living rooms, home theatres, and master suites.',
        spaceSlugs: '["living-room","bedroom"]',
        images: [
          { id: 'img-curt-3-1', url: '/images/products/curtains/velvet-curtains/royal-emerald.jpg', alt: 'Royal Emerald Heavyweight Matte Velvet Drapes in Grand Living Room', isMain: 1, order: 0 },
          { id: 'img-curt-3-2', url: '/images/products/curtains/velvet-curtains/prussian-navy.jpg', alt: 'Midnight Prussian Navy Velvet Drapery in Study', isMain: 0, order: 1 },
          { id: 'img-curt-3-3', url: '/images/products/curtains/velvet-curtains/fabric-detail.jpg', alt: 'Matte Velvet Lush Pile Detail', isMain: 0, order: 2 },
          { id: 'img-curt-3-4', url: '/images/products/curtains/velvet-curtains/main.jpg', alt: 'Velvet Curtains Room Setting View', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-vel-1', name: 'Royal Emerald', type: 'color', sku: 'ZA-CURT-VEL-01', hex: '#0F4D3A', thumb: '/images/products/curtains/velvet-curtains/royal-emerald.jpg', prev: '/images/products/curtains/velvet-curtains/royal-emerald.jpg', adj: 0, attrs: '{"Pile":"Cotton-Poly Matte Velvet","Acoustic":"NRC 0.65 Sound Absorbing"}' },
          { id: 'var-vel-2', name: 'Midnight Prussian Navy', type: 'color', sku: 'ZA-CURT-VEL-02', hex: '#172338', thumb: '/images/products/curtains/velvet-curtains/prussian-navy.jpg', prev: '/images/products/curtains/velvet-curtains/prussian-navy.jpg', adj: 0, attrs: '{"Pile":"Cotton-Poly Matte Velvet","Acoustic":"NRC 0.65 Sound Absorbing"}' },
          { id: 'var-vel-3', name: 'Warm Slate Charcoal', type: 'color', sku: 'ZA-CURT-VEL-03', hex: '#26292C', thumb: '/images/products/curtains/velvet-curtains/main.jpg', prev: '/images/products/curtains/velvet-curtains/main.jpg', adj: 0, attrs: '{"Pile":"Cotton-Poly Matte Velvet","Acoustic":"NRC 0.65 Sound Absorbing"}' },
        ],
        specs: [
          { label: 'Material', value: 'Premium Heavy Cotton-Poly Matte Velvet' },
          { label: 'Acoustic Rating', value: 'NRC 0.65 Sound Absorbing Architectural Drapery' },
          { label: 'Thermal Body', value: 'Dense Interlined Pile for Draft & Solar Reduction' },
          { label: 'Heading Styles', value: 'Triple Pinch Pleat, Goblet Pleat, Deep Pencil Pleat' },
          { label: 'Measurement Support', value: 'Complimentary In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Specialized Eco Dry Clean Recommended' },
        ]
      },
      {
        id: 'prod-curt-4',
        name: 'Pearl Lustre Fluid Plain Satin Curtains',
        displayName: 'Pearl Lustre Fluid Plain Satin Curtains',
        slug: 'satin-plain-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 3100,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Smooth lustrous satin plain curtains offering understated elegance, pearlescent radiance and fluid cascading folds.',
        desc: 'Tailored from ultra-dense satin weave that reflects gentle room lighting with understated pearlescent radiance. Features blind-stitched corner weights for seamless, fluid architectural ripples across living and dining spaces.',
        spaceSlugs: '["living-room","bedroom","dining"]',
        images: [
          { id: 'img-curt-4-1', url: '/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg', alt: 'Pearl Lustre Plain Satin Curtains in Penthouse Living Room', isMain: 1, order: 0 },
          { id: 'img-curt-4-2', url: '/images/products/curtains/satin-plain-curtains/champagne-gold.jpg', alt: 'Champagne Gold Heavy Sateen Drapery in Dining Room', isMain: 0, order: 1 },
          { id: 'img-curt-4-3', url: '/images/products/curtains/satin-plain-curtains/fabric-detail.jpg', alt: 'Liquid Lustre Satin Fabric Detail and Fold Sheen', isMain: 0, order: 2 },
          { id: 'img-curt-4-4', url: '/images/products/curtains/satin-plain-curtains/main.jpg', alt: 'Satin Plain Curtains Neutral Taupe Studio View', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-sat-1', name: 'Pearl Oyster', type: 'color', sku: 'ZA-CURT-SAT-01', hex: '#D9D9DC', thumb: '/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg', prev: '/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg', adj: 0, attrs: '{"Finish":"Anti-Static Silken Sheen","Weave":"High-Density Sateen"}' },
          { id: 'var-sat-2', name: 'Champagne Gold', type: 'color', sku: 'ZA-CURT-SAT-02', hex: '#EDE3D2', thumb: '/images/products/curtains/satin-plain-curtains/champagne-gold.jpg', prev: '/images/products/curtains/satin-plain-curtains/champagne-gold.jpg', adj: 0, attrs: '{"Finish":"Anti-Static Silken Sheen","Weave":"High-Density Sateen"}' },
          { id: 'var-sat-3', name: 'Warm Almond', type: 'color', sku: 'ZA-CURT-SAT-03', hex: '#D0C1AD', thumb: '/images/products/curtains/satin-plain-curtains/main.jpg', prev: '/images/products/curtains/satin-plain-curtains/main.jpg', adj: 0, attrs: '{"Finish":"Anti-Static Silken Sheen","Weave":"High-Density Sateen"}' },
        ],
        specs: [
          { label: 'Material', value: 'High-Density Lustrous Fluid Satin' },
          { label: 'Light Control', value: 'Soft Ambient Reflection with Thermal Interlining' },
          { label: 'Hemming', value: '10cm Hand-Turned Blind Hems with Corner Weights' },
          { label: 'Heading Styles', value: 'Double Pinch Pleat, Wave Ripplefold, Tailored Track' },
          { label: 'Measurement Support', value: 'Complimentary In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Eco Dry Clean or Gentle Steam Clean' },
        ]
      },
      {
        id: 'prod-curt-5',
        name: 'Heritage Damask Woven Jacquard Curtains',
        displayName: 'Heritage Damask Woven Jacquard Curtains',
        slug: 'jacquard-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 4200,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Intricately woven damask jacquard curtains with rich textural relief, metallic filigree threads and structured body.',
        desc: 'Woven on electronic jacquard looms with metallic filigree yarns, our Heritage Damask curtains combine classical Baroque motifs with contemporary dimensional relief and structured architectural body for luxury drawing rooms.',
        spaceSlugs: '["living-room","dining"]',
        images: [
          { id: 'img-curt-5-1', url: '/images/products/curtains/jacquard-curtains/heritage-damask.jpg', alt: 'Heritage Damask Woven Jacquard Curtains in Neoclassical Room', isMain: 1, order: 0 },
          { id: 'img-curt-5-2', url: '/images/products/curtains/jacquard-curtains/geometric-modern.jpg', alt: 'Contemporary Geometric Relief Jacquard Curtains in Apartment', isMain: 0, order: 1 },
          { id: 'img-curt-5-3', url: '/images/products/curtains/jacquard-curtains/fabric-detail.jpg', alt: 'Intricate Gold Woven Threads of Damask Jacquard', isMain: 0, order: 2 },
          { id: 'img-curt-5-4', url: '/images/products/curtains/jacquard-curtains/main.jpg', alt: 'Classic Jacquard Curtain Panel View', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-jac-1', name: 'Damask Filigree Gold', type: 'design', sku: 'ZA-CURT-JAC-01', hex: '#D4AF37', thumb: '/images/products/curtains/jacquard-curtains/heritage-damask.jpg', prev: '/images/products/curtains/jacquard-curtains/heritage-damask.jpg', adj: 0, attrs: '{"Pattern":"Heritage Baroque Damask","Weave":"Yarn-Dyed Electronic Loom"}' },
          { id: 'var-jac-2', name: 'Bronze Charcoal Geo', type: 'design', sku: 'ZA-CURT-JAC-02', hex: '#4A3B32', thumb: '/images/products/curtains/jacquard-curtains/geometric-modern.jpg', prev: '/images/products/curtains/jacquard-curtains/geometric-modern.jpg', adj: 0, attrs: '{"Pattern":"Architectural Geometric Relief","Weave":"Multi-Tonal Jacquard"}' },
          { id: 'var-jac-3', name: 'Classic Ivory Damask', type: 'design', sku: 'ZA-CURT-JAC-03', hex: '#F5F0E6', thumb: '/images/products/curtains/jacquard-curtains/main.jpg', prev: '/images/products/curtains/jacquard-curtains/main.jpg', adj: 0, attrs: '{"Pattern":"Classic Damask Brocade","Weave":"Yarn-Dyed Jacquard"}' },
        ],
        specs: [
          { label: 'Material', value: 'Yarn-Dyed Multi-Tonal Jacquard Brocade' },
          { label: 'Pattern Repeat', value: 'Seamless Precision Pattern Matching Across Panels' },
          { label: 'Lining Options', value: '100% Thermal Dimout or Light-Filtering Sateen' },
          { label: 'Heading Styles', value: 'French Pinch Pleat, Goblet Pleat, Tailored Pelmet' },
          { label: 'Measurement Support', value: 'Complimentary In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Specialist Dry Clean Only' },
        ]
      },
      {
        id: 'prod-curt-6',
        name: 'Pure European Flax Natural Linen Curtains',
        displayName: 'Pure European Flax Natural Linen Curtains',
        slug: 'linen-textured-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 3450,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Natural long-staple European flax linen curtains with organic slub textures, breathable weave and relaxed luxury drape.',
        desc: 'Woven from 100% authentic European flax, these natural textured curtains showcase organic slub yarns, natural drape, and breathable organic sophistication that softens with time and complements biophilic and Japandi interiors.',
        spaceSlugs: '["living-room","bedroom","windows"]',
        images: [
          { id: 'img-curt-6-1', url: '/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg', alt: 'Natural European Flax Linen Curtains in Warm Modern Room', isMain: 1, order: 0 },
          { id: 'img-curt-6-2', url: '/images/hero/curtains.jpg', alt: 'Olive Sage Green Slub Linen Curtains with Sheer Layer', isMain: 0, order: 1 },
          { id: 'img-curt-6-3', url: '/images/products/curtains/linen-textured-curtains/fabric-detail.jpg', alt: 'Natural Flax Slub Yarn Texture Macro Close-up', isMain: 0, order: 2 },
          { id: 'img-curt-6-4', url: '/images/products/curtains/linen-textured-curtains/main.jpg', alt: 'Linen & Textured Curtains Hanging View', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-lin-1', name: 'Natural Oatmeal Flax', type: 'color', sku: 'ZA-CURT-LIN-01', hex: '#D8CEBF', thumb: '/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg', prev: '/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg', adj: 0, attrs: '{"Composition":"100% Certified European Flax","Texture":"Authentic Natural Slub"}' },
          { id: 'var-lin-2', name: 'Olive Sage Linen', type: 'color', sku: 'ZA-CURT-LIN-02', hex: '#556B2F', thumb: '/images/hero/curtains.jpg', prev: '/images/hero/curtains.jpg', adj: 0, attrs: '{"Composition":"100% Certified European Flax","Texture":"Authentic Natural Slub"}' },
          { id: 'var-lin-3', name: 'Warm Sand Slub', type: 'color', sku: 'ZA-CURT-LIN-03', hex: '#C8B8A2', thumb: '/images/products/curtains/linen-textured-curtains/main.jpg', prev: '/images/products/curtains/linen-textured-curtains/main.jpg', adj: 0, attrs: '{"Composition":"100% Certified European Flax","Texture":"Authentic Natural Slub"}' },
        ],
        specs: [
          { label: 'Material', value: '100% Certified European Flax Linen' },
          { label: 'Weave', value: 'Organic Textured Slub Weave with Natural Body' },
          { label: 'Light Control', value: 'Naturally Filtered Sun Diffusion' },
          { label: 'Heading Styles', value: 'Soft Ripplefold, French Pinch Pleat, Hidden Tab' },
          { label: 'Measurement Support', value: 'Complimentary In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Eco Dry Clean or Low-Spin Delicate Cold Wash' },
        ]
      },
      {
        id: 'prod-curt-7',
        name: 'Botanical Flora Watercolor Digitally Printed Curtains',
        displayName: 'Botanical Flora Watercolor Digitally Printed Curtains',
        slug: 'digitally-printed-curtains',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 3200,
        startingPrice: 0,
        customMade: 0,
        customMeasurement: 0,
        shortDesc: 'Artistic blooming botanical motifs digitally printed on cotton-rich sateen with colorfast UV-resistant reactive pigments.',
        desc: 'High-definition reactive pigment printing on soft cotton-rich sateen brings blooming watercolor flora and verdant foliage to life with crisp artistic clarity and UV-fade resistance for sunrooms, living spaces, and cheerful bedrooms.',
        spaceSlugs: '["living-room","bedroom"]',
        images: [
          { id: 'img-curt-7-1', url: '/images/products/curtains/digitally-printed-curtains/main.jpg', alt: 'Botanical Flora Watercolor Printed Curtains in Sunlit Patio Room', isMain: 1, order: 0 },
          { id: 'img-curt-7-2', url: '/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg', alt: 'Indigo Midnight Flora Colorway Variant', isMain: 0, order: 1 },
          { id: 'img-curt-7-3', url: '/images/products/curtains/digitally-printed-curtains/fabric-detail.jpg', alt: 'Watercolor Botanical Printing Detail on Cotton Sateen', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-prt-1', name: 'Sage & Terracotta Flora', type: 'color', sku: 'ZA-CURT-PRT-01', hex: '#8A9A86', thumb: '/images/products/curtains/digitally-printed-curtains/main.jpg', prev: '/images/products/curtains/digitally-printed-curtains/main.jpg', adj: 0, attrs: '{"Base Fabric":"Cotton-Rich Smooth Sateen","Print Quality":"High-Definition Reactive"}' },
          { id: 'var-prt-2', name: 'Indigo Midnight Flora', type: 'color', sku: 'ZA-CURT-PRT-02', hex: '#2E3B55', thumb: '/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg', prev: '/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg', adj: 0, attrs: '{"Base Fabric":"Cotton-Rich Smooth Sateen","Print Quality":"High-Definition Reactive"}' },
        ],
        specs: [
          { label: 'Material', value: '100% Fine Combed Cotton Sateen' },
          { label: 'Print Technology', value: 'High-Definition Reactive Pigment Printing' },
          { label: 'Colorfastness', value: 'Grade 5 UV Resistance Against Sun Fading' },
          { label: 'Heading Styles', value: 'Double Pinch Pleat, Metal Eyelets' },
          { label: 'Care Guidelines', value: 'Cold Machine Wash with Mild Detergent, Line Dry' },
        ]
      },
      {
        id: 'prod-curt-8',
        name: 'Artisanal Mughal Floral Embroidered Curtains',
        displayName: 'Artisanal Mughal Floral Embroidered Curtains',
        slug: 'embroidered-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 4950,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Handcrafted thread embroidery and delicate floral borders on fine woven ground for grand, artisanal spaces.',
        desc: 'Handcrafted satin-stitch and chain-stitch thread embroidery adorns the borders and center panels of these heirloom curtains, blending Indian Mughal floral motifs with royal European drapery craftsmanship.',
        spaceSlugs: '["living-room","dining"]',
        images: [
          { id: 'img-curt-8-1', url: '/images/products/curtains/embroidered-curtains/main.jpg', alt: 'Artisanal Mughal Floral Embroidered Curtains in Drawing Room', isMain: 1, order: 0 },
          { id: 'img-curt-8-2', url: '/images/products/curtains/embroidered-curtains/silver-vine.jpg', alt: 'Platinum Silver Vine Embroidered Curtains Variant', isMain: 0, order: 1 },
          { id: 'img-curt-8-3', url: '/images/products/curtains/embroidered-curtains/fabric-detail.jpg', alt: 'Artisanal Chain-Stitch and Satin-Stitch Threadwork Detail', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-emb-1', name: 'Antique Gold on Ivory', type: 'color', sku: 'ZA-CURT-EMB-01', hex: '#D4AF37', thumb: '/images/products/curtains/embroidered-curtains/main.jpg', prev: '/images/products/curtains/embroidered-curtains/main.jpg', adj: 0, attrs: '{"Ground":"Raw Silk Cotton Blend","Thread":"Metallic Zari & Spun Silk"}' },
          { id: 'var-emb-2', name: 'Platinum Silver Vine', type: 'color', sku: 'ZA-CURT-EMB-02', hex: '#A9A9A9', thumb: '/images/products/curtains/embroidered-curtains/silver-vine.jpg', prev: '/images/products/curtains/embroidered-curtains/silver-vine.jpg', adj: 0, attrs: '{"Ground":"Raw Silk Cotton Blend","Thread":"Silver Lurex & Fine Silk"}' },
        ],
        specs: [
          { label: 'Material', value: 'Raw Silk Ground with Multi-Spindle Hand-Guided Embroidery' },
          { label: 'Threadwork', value: 'Metallic Zari & Fine Silk Yarn Needlework' },
          { label: 'Lining', value: 'Standard Semi-Lustre Cotton Sateen Underlay' },
          { label: 'Heading Styles', value: 'French Pinch Pleat, Tailored Pelmet, Eyelet' },
          { label: 'Measurement Support', value: 'Complimentary In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Specialized Eco Dry Clean Only' },
        ]
      },
      {
        id: 'prod-curt-9',
        name: 'Celestial Stars & Clouds Pastel Kids Curtains',
        displayName: 'Celestial Stars & Clouds Pastel Kids Curtains',
        slug: 'kids-room-curtains',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 2850,
        startingPrice: 0,
        customMade: 0,
        customMeasurement: 0,
        shortDesc: 'Playful, hypoallergenic and easy-to-clean window curtains with 99%+ blackout lining tailored for children bedrooms and nurseries.',
        desc: 'Playful celestial star and moon patterns woven on 100% hypoallergenic OEKO-TEX certified cotton with an integrated thermal blackout backing for deep, restful daytime naps and cozy bedtime stories.',
        spaceSlugs: '["bedroom"]',
        images: [
          { id: 'img-curt-9-1', url: '/images/products/curtains/kids-room-curtains/main.jpg', alt: 'Celestial Stars Pastel Kids Room Curtains in Nursery with Plush Bunny', isMain: 1, order: 0 },
          { id: 'img-curt-9-2', url: '/images/products/curtains/kids-room-curtains/blush-dreams.jpg', alt: 'Blush Pink Dreams Kids Room Curtain Variant', isMain: 0, order: 1 },
          { id: 'img-curt-9-3', url: '/images/products/curtains/kids-room-curtains/sky-blue.jpg', alt: 'Sky Blue Starlight Kids Room Curtain Variant', isMain: 0, order: 2 },
          { id: 'img-curt-9-4', url: '/images/products/curtains/kids-room-curtains/fabric-detail.jpg', alt: 'Celestial Star and Moon Pattern Fabric Close-Up', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-kid-1', name: 'Pastel Starry Cream', type: 'color', sku: 'ZA-CURT-KID-01', hex: '#EBE5D8', thumb: '/images/products/curtains/kids-room-curtains/main.jpg', prev: '/images/products/curtains/kids-room-curtains/main.jpg', adj: 0, attrs: '{"Certification":"OEKO-TEX Standard 100","Blackout":"99%+ Total Room Darkening"}' },
          { id: 'var-kid-2', name: 'Blush Pink Dreams', type: 'color', sku: 'ZA-CURT-KID-02', hex: '#E8B4B8', thumb: '/images/products/curtains/kids-room-curtains/blush-dreams.jpg', prev: '/images/products/curtains/kids-room-curtains/blush-dreams.jpg', adj: 0, attrs: '{"Certification":"OEKO-TEX Standard 100","Blackout":"99%+ Total Room Darkening"}' },
          { id: 'var-kid-3', name: 'Sky Blue Starlight', type: 'color', sku: 'ZA-CURT-KID-03', hex: '#A4C2CB', thumb: '/images/products/curtains/kids-room-curtains/sky-blue.jpg', prev: '/images/products/curtains/kids-room-curtains/sky-blue.jpg', adj: 0, attrs: '{"Certification":"OEKO-TEX Standard 100","Blackout":"99%+ Total Room Darkening"}' },
        ],
        specs: [
          { label: 'Material', value: '100% OEKO-TEX Standard 100 Hypoallergenic Cotton' },
          { label: 'Light Control', value: '99%+ Blackout Lining for Undisturbed Sleep' },
          { label: 'Safety', value: 'Cordless Child-Safe Heading and Non-Toxic Dyes' },
          { label: 'Heading Styles', value: 'Double Pinch Pleat, Eyelet Ring' },
          { label: 'Care Guidelines', value: 'Machine Washable at 30°C Delicate Cycle' },
        ]
      },
      {
        id: 'prod-curt-10',
        name: 'Bespoke Atelier Made-to-Measure Curtains',
        displayName: 'Bespoke Atelier Made-to-Measure Curtains',
        slug: 'customized-made-to-measure-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 3600,
        startingPrice: 1,
        customMade: 1,
        customMeasurement: 1,
        shortDesc: 'Bespoke custom curtains tailored to your exact window drop and width with choice of pleat style, lining, and doorstep fabric catalogues.',
        desc: 'Zaira’s master atelier bespoke curtain service. Our drapery consultants visit your residence with designer fabric swatch rings, take millimeter-exact laser drop measurements, and tailor custom headings including double pinch pleats, ripplefold waves, and motorized recessed tracks.',
        spaceSlugs: '["living-room","bedroom","windows"]',
        images: [
          { id: 'img-curt-10-1', url: '/images/products/curtains/custom-made-curtains/main.jpg', alt: 'Floor-to-Ceiling Architectural Double Drapery with Ripplefold Wave', isMain: 1, order: 0 },
          { id: 'img-curt-10-2', url: '/images/products/curtains/custom-made-curtains/atelier-craft.jpg', alt: 'Master Atelier Seamstress Hand-Crafting Custom Pinch Pleats', isMain: 0, order: 1 },
          { id: 'img-curt-10-3', url: '/images/products/curtains/custom-made-curtains/fabric-swatches.jpg', alt: 'Doorstep Designer Fabric Swatch Ring Consultation', isMain: 0, order: 2 },
          { id: 'img-curt-10-4', url: '/images/products/curtains/custom-made-curtains/laser-measurement.jpg', alt: 'Free In-Home Laser Precision Window Measurement Service', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-cst-1', name: 'Tailored Double Pinch Pleat', type: 'design', sku: 'ZA-CURT-CST-01', hex: '#8B7355', thumb: '/images/products/curtains/custom-made-curtains/main.jpg', prev: '/images/products/curtains/custom-made-curtains/main.jpg', adj: 0, attrs: '{"Heading Style":"Double Pinch Pleat","Tailoring":"Hand-Finished Atelier"}' },
          { id: 'var-cst-2', name: 'Wave Ripplefold Ceiling Track', type: 'design', sku: 'ZA-CURT-CST-02', hex: '#6E7B8B', thumb: '/images/products/curtains/custom-made-curtains/main.jpg', prev: '/images/products/curtains/custom-made-curtains/main.jpg', adj: 0, attrs: '{"Heading Style":"Ripplefold Wave","Tailoring":"Architectural Ceiling Track"}' },
          { id: 'var-cst-3', name: 'Deep French 3-Fold Pleat', type: 'design', sku: 'ZA-CURT-CST-03', hex: '#556B2F', thumb: '/images/products/curtains/custom-made-curtains/main.jpg', prev: '/images/products/curtains/custom-made-curtains/main.jpg', adj: 0, attrs: '{"Heading Style":"French 3-Fold Pleat","Tailoring":"Weighted Bottom Hems"}' },
        ],
        specs: [
          { label: 'Customization Scope', value: 'Exact Millimeter Drop, Width, Pleat Ratio & Hardware' },
          { label: 'Site Service', value: 'Complimentary Doorstep Laser Measurement & Swatches' },
          { label: 'Heading Styles', value: 'Double Pinch, French Pleat, Wave Ripplefold, Motorized' },
          { label: 'Lining Options', value: '100% Blackout, Thermal Fleece, or Light-Filtering Sateen' },
          { label: 'Turnaround', value: 'Master Atelier Tailoring with White-Glove Installation' },
          { label: 'Care Guidelines', value: 'Professional On-Site Steaming or Specialist Eco Dry Clean' },
        ]
      }
    ];

    // Apply updates to existing products
    const updateProductStmt = db.prepare(`
      UPDATE products 
      SET name = ?, display_name = ?, short_description = ?, description = ?,
          product_type = ?, pricing_type = ?, base_price = ?, starting_price = ?,
          custom_made = ?, custom_measurement_available = ?, space_slugs = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    const delImagesStmt = db.prepare('DELETE FROM product_images WHERE product_id = ?');
    const insImageStmt = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `);

    const delVariantsStmt = db.prepare('DELETE FROM product_variants WHERE product_id = ?');
    const insVariantStmt = db.prepare(`
      INSERT INTO product_variants (id, product_id, name, variant_type, sku, color_hex, thumbnail_image, preview_image, price_adjustment, in_stock, attributes, display_order, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 1, datetime('now'))
    `);

    const delSpecsStmt = db.prepare('DELETE FROM product_specifications WHERE product_id = ?');
    const insSpecStmt = db.prepare(`
      INSERT INTO product_specifications (id, product_id, label, value, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const u of updates) {
      updateProductStmt.run(
        u.name, u.displayName, u.shortDesc, u.desc,
        u.productType, u.pricingType, u.basePrice, u.startingPrice,
        u.customMade, u.customMeasurement, u.spaceSlugs,
        u.id
      );

      // Refresh images
      delImagesStmt.run(u.id);
      for (const img of u.images) {
        insImageStmt.run(img.id, u.id, img.url, img.alt, img.order, img.isMain);
      }

      // Refresh variants
      delVariantsStmt.run(u.id);
      for (let i = 0; i < u.variants.length; i++) {
        const v = u.variants[i];
        insVariantStmt.run(v.id, u.id, v.name, v.type, v.sku, v.hex, v.thumb, v.prev, v.adj, v.attrs, i);
      }

      // Refresh specifications
      delSpecsStmt.run(u.id);
      for (let i = 0; i < u.specs.length; i++) {
        const s = u.specs[i];
        insSpecStmt.run(`spec-${u.id}-${i}`, u.id, s.label, s.value, i);
      }

      console.log(`Updated existing curtain product: ${u.id} (${u.name})`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. INSERT NEW CURATED PRODUCTS TO COMPLETE EACH CURTAIN TYPE
    // ══════════════════════════════════════════════════════════════════════════

    const newProducts = [
      // Sheer Curtains (sub-curtains-drapes-sheer)
      {
        id: 'prod-curt-2b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-sheer',
        name: 'Warm Champagne Luxe Voile Curtains',
        displayName: 'Warm Champagne Luxe Voile Curtains',
        slug: 'warm-champagne-luxe-voile-curtains',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 2650,
        startingPrice: 0,
        unit: 'panel',
        customMade: 0,
        featured: 0,
        customMeasurement: 0,
        active: 1,
        displayOrder: 22,
        spaceSlugs: '["bedroom","living-room"]',
        shortDesc: 'Lustrous champagne voile curtains woven with micro-fine yarns that catch natural ambient light for immediate room elevation.',
        desc: 'Lustrous champagne voile woven with micro-fine yarns that catch natural ambient light. Pre-tailored with high-precision pinch pleats for immediate elegant room transformation and delicate daytime privacy.',
        images: [
          { id: 'img-curt-2b-1', url: '/images/products/curtains/sheer-day-curtains/champagne-room.jpg', alt: 'Warm Champagne Luxe Voile Curtains in Master Suite', isMain: 1, order: 0 },
          { id: 'img-curt-2b-2', url: '/images/products/curtains/sheer-day-curtains/ivory-voile.jpg', alt: 'Ivory Sheer Alternative View', isMain: 0, order: 1 },
          { id: 'img-curt-2b-3', url: '/images/products/curtains/sheer-day-curtains/fabric-detail.jpg', alt: 'Voile Weave Texture Detail', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-sheer-2b-1', name: 'Warm Champagne', type: 'color', sku: 'ZA-CURT-SHR2-01', hex: '#F7F0E6', thumb: '/images/products/curtains/sheer-day-curtains/champagne-room.jpg', prev: '/images/products/curtains/sheer-day-curtains/champagne-room.jpg', adj: 0, attrs: '{"Opacity":"Translucent Day Sheer","Weave":"Micro-Fine Voile"}' },
          { id: 'var-sheer-2b-2', name: 'Snow Voile', type: 'color', sku: 'ZA-CURT-SHR2-02', hex: '#FFFFFF', thumb: '/images/products/curtains/sheer-day-curtains/main.jpg', prev: '/images/products/curtains/sheer-day-curtains/main.jpg', adj: 0, attrs: '{"Opacity":"Translucent Day Sheer","Weave":"Micro-Fine Voile"}' },
        ],
        specs: [
          { label: 'Material', value: '100% Micro-Fine Spun Voile' },
          { label: 'Light Control', value: 'Filtered Ambient Sunlight' },
          { label: 'Heading Styles', value: 'Pre-Gathered Double Pinch Pleat' },
          { label: 'Care Guidelines', value: 'Machine Wash Delicate 30°C' },
        ]
      },

      // Velvet Curtains (sub-curtains-drapes-velvet)
      {
        id: 'prod-curt-3b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-velvet',
        name: 'Prussian Midnight Acoustic Velvet Curtains',
        displayName: 'Prussian Midnight Acoustic Velvet Curtains',
        slug: 'prussian-midnight-acoustic-velvet-curtains',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 4850,
        startingPrice: 1,
        unit: 'panel',
        customMade: 1,
        featured: 0,
        customMeasurement: 1,
        active: 1,
        displayOrder: 23,
        spaceSlugs: '["bedroom","living-room"]',
        shortDesc: 'Designed for home theatres and executive suites, Prussian Midnight velvet curtains pair acoustic damping with majestic deep navy drape.',
        desc: 'Designed for home theatres, executive libraries, and master bedrooms, our Prussian Midnight velvet curtains pair acoustic-damping dense weave with majestic deep navy drapery body, creating a quiet sanctuary.',
        images: [
          { id: 'img-curt-3b-1', url: '/images/products/curtains/velvet-curtains/prussian-navy.jpg', alt: 'Prussian Midnight Acoustic Velvet Curtains in Moody Executive Study', isMain: 1, order: 0 },
          { id: 'img-curt-3b-2', url: '/images/products/curtains/velvet-curtains/royal-emerald.jpg', alt: 'Royal Emerald Alternative Velvet View', isMain: 0, order: 1 },
          { id: 'img-curt-3b-3', url: '/images/products/curtains/velvet-curtains/fabric-detail.jpg', alt: 'Velvet Lush Dense Pile Detail', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-vel-3b-1', name: 'Prussian Navy', type: 'color', sku: 'ZA-CURT-VEL2-01', hex: '#172338', thumb: '/images/products/curtains/velvet-curtains/prussian-navy.jpg', prev: '/images/products/curtains/velvet-curtains/prussian-navy.jpg', adj: 0, attrs: '{"Fabric":"Dense Architectural Velvet","Acoustic":"NRC 0.68 Sound Barrier"}' },
          { id: 'var-vel-3b-2', name: 'Royal Emerald', type: 'color', sku: 'ZA-CURT-VEL2-02', hex: '#0F4D3A', thumb: '/images/products/curtains/velvet-curtains/royal-emerald.jpg', prev: '/images/products/curtains/velvet-curtains/royal-emerald.jpg', adj: 0, attrs: '{"Fabric":"Dense Architectural Velvet","Acoustic":"NRC 0.68 Sound Barrier"}' },
        ],
        specs: [
          { label: 'Material', value: 'Ultra-Dense Architectural Cotton Velvet' },
          { label: 'Light Control', value: '95%+ Dimout & Glare Protection' },
          { label: 'Acoustic Performance', value: 'Sound Damping Reverberation Barrier' },
          { label: 'Heading Styles', value: 'French Pinch Pleat, Heavy Track Runner' },
          { label: 'Measurement Support', value: 'Free In-Home Laser Measurement Included' },
          { label: 'Care Guidelines', value: 'Specialist Eco Dry Clean Only' },
        ]
      },

      // Satin Plain Curtains (sub-curtains-drapes-satin)
      {
        id: 'prod-curt-4b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-satin',
        name: 'Champagne Elegance Heavy Sateen Curtains',
        displayName: 'Champagne Elegance Heavy Sateen Curtains',
        slug: 'champagne-heavy-sateen-curtains',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 3350,
        startingPrice: 0,
        unit: 'panel',
        customMade: 0,
        featured: 0,
        customMeasurement: 0,
        active: 1,
        displayOrder: 24,
        spaceSlugs: '["dining","living-room"]',
        shortDesc: 'Heavyweight champagne sateen drapery panel providing formal dining and lounge elegance with effortless hanging appeal.',
        desc: 'Heavyweight champagne sateen drapery panel providing formal dining and lounge elegance with effortless hanging appeal and fluid vertical folds.',
        images: [
          { id: 'img-curt-4b-1', url: '/images/products/curtains/satin-plain-curtains/champagne-gold.jpg', alt: 'Champagne Elegance Heavy Sateen Curtains in Formal Dining Room', isMain: 1, order: 0 },
          { id: 'img-curt-4b-2', url: '/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg', alt: 'Pearl Silver Plain Satin View', isMain: 0, order: 1 },
          { id: 'img-curt-4b-3', url: '/images/products/curtains/satin-plain-curtains/fabric-detail.jpg', alt: 'Liquid Sateen Fabric Close-Up', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-sat-4b-1', name: 'Champagne Gold', type: 'color', sku: 'ZA-CURT-SAT2-01', hex: '#EDE3D2', thumb: '/images/products/curtains/satin-plain-curtains/champagne-gold.jpg', prev: '/images/products/curtains/satin-plain-curtains/champagne-gold.jpg', adj: 0, attrs: '{"Weave":"Heavyweight Sateen","Finish":"Anti-Static Silken Sheen"}' },
          { id: 'var-sat-4b-2', name: 'Pearl Oyster', type: 'color', sku: 'ZA-CURT-SAT2-02', hex: '#D9D9DC', thumb: '/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg', prev: '/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg', adj: 0, attrs: '{"Weave":"Heavyweight Sateen","Finish":"Anti-Static Silken Sheen"}' },
        ],
        specs: [
          { label: 'Material', value: 'Heavyweight Liquid Sateen' },
          { label: 'Finish', value: 'Anti-Static Silken Sheen' },
          { label: 'Heading Styles', value: 'Dual Pinch Pleat & Eyelet Ring' },
          { label: 'Care Guidelines', value: 'Gentle Cold Cycle or Dry Clean' },
        ]
      },

      // Jacquard Curtains (sub-curtains-drapes-jacquard)
      {
        id: 'prod-curt-5b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-jacquard',
        name: 'Architectural Geometric Relief Jacquard Drapes',
        displayName: 'Architectural Geometric Relief Jacquard Drapes',
        slug: 'architectural-geometric-jacquard-drapes',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 4450,
        startingPrice: 1,
        unit: 'panel',
        customMade: 1,
        featured: 0,
        customMeasurement: 1,
        active: 1,
        displayOrder: 25,
        spaceSlugs: '["living-room","dining"]',
        shortDesc: 'Structured relief patterns in bronze and charcoal create striking tactile depth in modern architectural spaces.',
        desc: 'A modern architectural interpretation of jacquard weaving. Structured relief patterns in bronze and charcoal create striking tactile depth in contemporary urban spaces and penthouses.',
        images: [
          { id: 'img-curt-5b-1', url: '/images/products/curtains/jacquard-curtains/geometric-modern.jpg', alt: 'Architectural Geometric Relief Jacquard Drapes in Penthouse', isMain: 1, order: 0 },
          { id: 'img-curt-5b-2', url: '/images/products/curtains/jacquard-curtains/heritage-damask.jpg', alt: 'Heritage Damask Jacquard View', isMain: 0, order: 1 },
          { id: 'img-curt-5b-3', url: '/images/products/curtains/jacquard-curtains/fabric-detail.jpg', alt: 'Jacquard Weave Thread Detail', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-jac-5b-1', name: 'Bronze Charcoal Geo', type: 'design', sku: 'ZA-CURT-JAC2-01', hex: '#4A3B32', thumb: '/images/products/curtains/jacquard-curtains/geometric-modern.jpg', prev: '/images/products/curtains/jacquard-curtains/geometric-modern.jpg', adj: 0, attrs: '{"Pattern":"Structured Geometric Relief","Loom":"Electronic Multi-Shuttle Jacquard"}' },
          { id: 'var-jac-5b-2', name: 'Gold Heritage Damask', type: 'design', sku: 'ZA-CURT-JAC2-02', hex: '#D4AF37', thumb: '/images/products/curtains/jacquard-curtains/heritage-damask.jpg', prev: '/images/products/curtains/jacquard-curtains/heritage-damask.jpg', adj: 0, attrs: '{"Pattern":"Heritage Baroque Damask","Loom":"Electronic Multi-Shuttle Jacquard"}' },
        ],
        specs: [
          { label: 'Material', value: 'Structured Geometric Weave Jacquard' },
          { label: 'Texture', value: 'Raised Dimensional Tactile Relief' },
          { label: 'Heading Styles', value: 'Ripplefold Wave, Tailored Pinch Pleat' },
          { label: 'Measurement Support', value: 'Free Doorstep Swatch Presentation Included' },
          { label: 'Care Guidelines', value: 'Professional Dry Clean' },
        ]
      },

      // Linen & Textured Curtains (sub-curtains-drapes-linen)
      {
        id: 'prod-curt-6b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-linen',
        name: 'Olive Slub Relaxed European Linen Drapes',
        displayName: 'Olive Slub Relaxed European Linen Drapes',
        slug: 'olive-slub-relaxed-linen-drapes',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 3600,
        startingPrice: 0,
        unit: 'panel',
        customMade: 0,
        featured: 0,
        customMeasurement: 0,
        active: 1,
        displayOrder: 26,
        spaceSlugs: '["living-room","bedroom"]',
        shortDesc: 'Organic olive green linen curtains bringing biophilic warmth and natural earthy tones to contemporary living spaces.',
        desc: 'Organic olive green linen curtains that bring biophilic warmth and natural earthy tones to contemporary living spaces. Features a relaxed organic slub drape that softens naturally with age.',
        images: [
          { id: 'img-curt-6b-1', url: '/images/hero/curtains.jpg', alt: 'Olive Slub Relaxed European Linen Drapes in Sunlit Corner', isMain: 1, order: 0 },
          { id: 'img-curt-6b-2', url: '/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg', alt: 'Natural Oatmeal Flax Linen Alternative View', isMain: 0, order: 1 },
          { id: 'img-curt-6b-3', url: '/images/products/curtains/linen-textured-curtains/fabric-detail.jpg', alt: 'Linen Slub Thread Macro Detail', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-lin-6b-1', name: 'Olive Sage Slub', type: 'color', sku: 'ZA-CURT-LIN2-01', hex: '#556B2F', thumb: '/images/hero/curtains.jpg', prev: '/images/hero/curtains.jpg', adj: 0, attrs: '{"Composition":"100% Washed European Flax","Finish":"Enzyme Softened Slub"}' },
          { id: 'var-lin-6b-2', name: 'Natural Oatmeal', type: 'color', sku: 'ZA-CURT-LIN2-02', hex: '#D8CEBF', thumb: '/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg', prev: '/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg', adj: 0, attrs: '{"Composition":"100% Washed European Flax","Finish":"Enzyme Softened Slub"}' },
        ],
        specs: [
          { label: 'Material', value: 'Washed Long-Staple European Flax Linen' },
          { label: 'Opacity', value: 'Light-to-Medium Natural Filtering' },
          { label: 'Heading Styles', value: 'Versatile Back-Tab and Rod Pocket' },
          { label: 'Care Guidelines', value: 'Machine Wash Delicate, Hang Dry' },
        ]
      },

      // Digitally Printed Curtains (sub-curtains-drapes-printed)
      {
        id: 'prod-curt-7b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-printed',
        name: 'Indigo Bloom Artistic Digitally Printed Curtains',
        displayName: 'Indigo Bloom Artistic Digitally Printed Curtains',
        slug: 'indigo-bloom-printed-curtains',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 3400,
        startingPrice: 0,
        unit: 'panel',
        customMade: 0,
        featured: 0,
        customMeasurement: 0,
        active: 1,
        displayOrder: 27,
        spaceSlugs: '["bedroom","living-room"]',
        shortDesc: 'Vibrant indigo and teal watercolor botanicals create an artistic statement piece for modern sunrooms and bedrooms.',
        desc: 'Vibrant indigo and teal watercolor botanicals create an artistic statement piece for modern sunrooms, dining alcoves, and master bedrooms with crisp detail and soft filtered light.',
        images: [
          { id: 'img-curt-7b-1', url: '/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg', alt: 'Indigo Bloom Artistic Digitally Printed Curtains in Bedroom Window', isMain: 1, order: 0 },
          { id: 'img-curt-7b-2', url: '/images/products/curtains/digitally-printed-curtains/main.jpg', alt: 'Sage Botanical Printed Curtains View', isMain: 0, order: 1 },
          { id: 'img-curt-7b-3', url: '/images/products/curtains/digitally-printed-curtains/fabric-detail.jpg', alt: 'Textile Printing Pigment Detail', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-prt-7b-1', name: 'Indigo Midnight Flora', type: 'color', sku: 'ZA-CURT-PRT2-01', hex: '#2E3B55', thumb: '/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg', prev: '/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg', adj: 0, attrs: '{"Base Fabric":"Cotton-Linen Canvas","Print Type":"High-Definition Reactive"}' },
          { id: 'var-prt-7b-2', name: 'Sage & Terracotta Flora', type: 'color', sku: 'ZA-CURT-PRT2-02', hex: '#8A9A86', thumb: '/images/products/curtains/digitally-printed-curtains/main.jpg', prev: '/images/products/curtains/digitally-printed-curtains/main.jpg', adj: 0, attrs: '{"Base Fabric":"Cotton-Linen Canvas","Print Type":"High-Definition Reactive"}' },
        ],
        specs: [
          { label: 'Material', value: 'Smooth Drape Cotton-Linen Canvas' },
          { label: 'Light Control', value: 'Moderate Privacy with Daylight Glow' },
          { label: 'Heading Styles', value: 'French Pinch Pleat, Ring Header' },
          { label: 'Care Guidelines', value: 'Gentle Machine Wash Cold' },
        ]
      },

      // Embroidered Curtains (sub-curtains-drapes-embroidered)
      {
        id: 'prod-curt-8b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-embroidered',
        name: 'Chantilly Corded Lace Embroidered Drapes',
        displayName: 'Chantilly Corded Lace Embroidered Drapes',
        slug: 'chantilly-lace-embroidered-drapes',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 5200,
        startingPrice: 1,
        unit: 'panel',
        customMade: 1,
        featured: 0,
        customMeasurement: 1,
        active: 1,
        displayOrder: 28,
        spaceSlugs: '["living-room","dining"]',
        shortDesc: 'Exquisite corded lace borders and delicate needlework vines woven across pure ivory ground for grand reception rooms.',
        desc: 'Exquisite corded lace borders and delicate needlework vines woven across pure ivory ground, designed for grand master suites, heritage living spaces, and formal reception rooms.',
        images: [
          { id: 'img-curt-8b-1', url: '/images/products/curtains/embroidered-curtains/silver-vine.jpg', alt: 'Chantilly Corded Lace Embroidered Drapes in Grand Room', isMain: 1, order: 0 },
          { id: 'img-curt-8b-2', url: '/images/products/curtains/embroidered-curtains/main.jpg', alt: 'Antique Gold Embroidered Curtains View', isMain: 0, order: 1 },
          { id: 'img-curt-8b-3', url: '/images/products/curtains/embroidered-curtains/fabric-detail.jpg', alt: 'Precision Needlework and Threadwork Close-Up', isMain: 0, order: 2 },
        ],
        variants: [
          { id: 'var-emb-8b-1', name: 'Platinum Silver Vine', type: 'color', sku: 'ZA-CURT-EMB2-01', hex: '#A9A9A9', thumb: '/images/products/curtains/embroidered-curtains/silver-vine.jpg', prev: '/images/products/curtains/embroidered-curtains/silver-vine.jpg', adj: 0, attrs: '{"Ground":"Fine Woven Sateen","Border":"Corded Chantilly Needlework"}' },
          { id: 'var-emb-8b-2', name: 'Antique Gold on Ivory', type: 'color', sku: 'ZA-CURT-EMB2-02', hex: '#D4AF37', thumb: '/images/products/curtains/embroidered-curtains/main.jpg', prev: '/images/products/curtains/embroidered-curtains/main.jpg', adj: 0, attrs: '{"Ground":"Fine Woven Sateen","Border":"Corded Chantilly Needlework"}' },
        ],
        specs: [
          { label: 'Material', value: 'Fine Woven Sateen with Corded Lace Border' },
          { label: 'Craftsmanship', value: 'Hand-Guided Artisanal Detailing' },
          { label: 'Heading Styles', value: 'Triple Pinch Pleat, Goblet Pleat' },
          { label: 'Measurement Support', value: 'Free Doorstep Measurement Visit Included' },
          { label: 'Care Guidelines', value: 'Specialist Dry Clean Only' },
        ]
      },

      // Kids Room Curtains (sub-curtains-drapes-kids)
      {
        id: 'prod-curt-9b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-kids',
        name: 'Blush Starlight Nursery Blackout Curtains',
        displayName: 'Blush Starlight Nursery Blackout Curtains',
        slug: 'blush-starlight-nursery-curtains',
        productType: 'standard',
        pricingType: 'fixed',
        basePrice: 2950,
        startingPrice: 0,
        unit: 'panel',
        customMade: 0,
        featured: 0,
        customMeasurement: 0,
        active: 1,
        displayOrder: 29,
        spaceSlugs: '["bedroom"]',
        shortDesc: 'Delicate blush pink nursery blackout curtains with shimmering celestial star motifs and 100% room darkening.',
        desc: 'Delicate blush pink nursery blackout curtains with shimmering celestial star motifs, providing a soothing fairytale atmosphere and complete darkness on demand for sound naps.',
        images: [
          { id: 'img-curt-9b-1', url: '/images/products/curtains/kids-room-curtains/blush-dreams.jpg', alt: 'Blush Starlight Nursery Blackout Curtains in Playful Room', isMain: 1, order: 0 },
          { id: 'img-curt-9b-2', url: '/images/products/curtains/kids-room-curtains/sky-blue.jpg', alt: 'Sky Blue Starlight Variant View', isMain: 0, order: 1 },
          { id: 'img-curt-9b-3', url: '/images/products/curtains/kids-room-curtains/main.jpg', alt: 'Pastel Celestial Stars Cream View', isMain: 0, order: 2 },
          { id: 'img-curt-9b-4', url: '/images/products/curtains/kids-room-curtains/fabric-detail.jpg', alt: 'Hypoallergenic Celestial Fabric Detail', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-kid-9b-1', name: 'Blush Pink Dreams', type: 'color', sku: 'ZA-CURT-KID2-01', hex: '#E8B4B8', thumb: '/images/products/curtains/kids-room-curtains/blush-dreams.jpg', prev: '/images/products/curtains/kids-room-curtains/blush-dreams.jpg', adj: 0, attrs: '{"Fabric":"Brushed Hypoallergenic Microfiber","Blackout":"100% Total Room Darkening"}' },
          { id: 'var-kid-9b-2', name: 'Sky Blue Starlight', type: 'color', sku: 'ZA-CURT-KID2-02', hex: '#A4C2CB', thumb: '/images/products/curtains/kids-room-curtains/sky-blue.jpg', prev: '/images/products/curtains/kids-room-curtains/sky-blue.jpg', adj: 0, attrs: '{"Fabric":"Brushed Hypoallergenic Microfiber","Blackout":"100% Total Room Darkening"}' },
          { id: 'var-kid-9b-3', name: 'Pastel Starry Cream', type: 'color', sku: 'ZA-CURT-KID2-03', hex: '#EBE5D8', thumb: '/images/products/curtains/kids-room-curtains/main.jpg', prev: '/images/products/curtains/kids-room-curtains/main.jpg', adj: 0, attrs: '{"Fabric":"Brushed Hypoallergenic Microfiber","Blackout":"100% Total Room Darkening"}' },
        ],
        specs: [
          { label: 'Material', value: 'Hypoallergenic Brushed Microfiber with Thermal Layer' },
          { label: 'Light Control', value: '100% Total Room Darkening' },
          { label: 'Safety', value: 'Free of Lead, Phthalates, and Harsh Chemicals' },
          { label: 'Heading Styles', value: 'Double Pinch Pleat, Eyelet Ring' },
          { label: 'Care Guidelines', value: 'Machine Wash Cold, Tumble Dry Low' },
        ]
      },

      // Customized / Made-to-Measure (sub-curtains-drapes-custom)
      {
        id: 'prod-curt-10b',
        catId: 'cat-1',
        subId: 'sub-curtains-drapes-custom',
        name: 'Architectural Ripplefold Motorized Master Drapes',
        displayName: 'Architectural Ripplefold Motorized Master Drapes',
        slug: 'architectural-ripplefold-motorized-drapes',
        productType: 'custom_made',
        pricingType: 'per_panel',
        basePrice: 4200,
        startingPrice: 1,
        unit: 'panel',
        customMade: 1,
        featured: 0,
        customMeasurement: 1,
        active: 1,
        displayOrder: 30,
        spaceSlugs: '["living-room","bedroom","windows"]',
        shortDesc: 'Motorized smart ceiling-recessed ripplefold drapery designed for double-height windows and luxury villa master suites.',
        desc: 'Motorized smart ceiling-recessed ripplefold drapery designed for double-height architectural windows and high-ceiling villas. Integrates with smart home automation for whisper-quiet remote operation and dramatic continuous wave stacking.',
        images: [
          { id: 'img-curt-10b-1', url: '/images/products/curtains/custom-made-curtains/main.jpg', alt: 'Floor-to-Ceiling Motorized Ripplefold Wave Drapery', isMain: 1, order: 0 },
          { id: 'img-curt-10b-2', url: '/images/products/curtains/custom-made-curtains/atelier-craft.jpg', alt: 'Atelier Seamstress Precision Pleating', isMain: 0, order: 1 },
          { id: 'img-curt-10b-3', url: '/images/products/curtains/custom-made-curtains/fabric-swatches.jpg', alt: 'Custom Fabric Swatch Catalogues', isMain: 0, order: 2 },
          { id: 'img-curt-10b-4', url: '/images/products/curtains/custom-made-curtains/laser-measurement.jpg', alt: 'Laser Precision On-Site Sizing Visit', isMain: 0, order: 3 },
        ],
        variants: [
          { id: 'var-cst-10b-1', name: 'Somfy Motorized Ceiling Track', type: 'design', sku: 'ZA-CURT-CST2-01', hex: '#2E3B55', thumb: '/images/products/curtains/custom-made-curtains/main.jpg', prev: '/images/products/curtains/custom-made-curtains/main.jpg', adj: 0, attrs: '{"Automation":"Somfy RTS / Zigbee","Track":"Recessed Architectural"}' },
          { id: 'var-cst-10b-2', name: 'Dual Sheer & Blackout Tandem', type: 'design', sku: 'ZA-CURT-CST2-02', hex: '#4A4A4A', thumb: '/images/products/curtains/custom-made-curtains/main.jpg', prev: '/images/products/curtains/custom-made-curtains/main.jpg', adj: 0, attrs: '{"Automation":"Dual Motorized Tandem","Track":"Ceiling Pelmet"}' },
        ],
        specs: [
          { label: 'Automation', value: 'Smart Home Compatible (Alexa, Google, Zigbee, Control4)' },
          { label: 'Track Design', value: 'Ultra-Quiet Heavy-Duty Aluminum Ripplefold Track' },
          { label: 'Sizing', value: 'Custom Sized to Unlimited Continuous Widths' },
          { label: 'Service', value: 'Complete End-to-End Electrical Wiring & White-Glove Mounting' },
          { label: 'Warranty', value: '5-Year Comprehensive Motor & Hardware Warranty' },
        ]
      }
    ];

    const insProductStmt = db.prepare(`
      INSERT INTO products (
        id, category_id, subcategory_id, name, display_name, slug,
        description, short_description, product_type, pricing_type,
        base_price, starting_price, unit, custom_made, featured,
        custom_measurement_available, active, display_order, currency,
        space_slugs, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, '₹',
        ?, datetime('now'), datetime('now')
      )
    `);

    for (const p of newProducts) {
      // Check if product already exists
      const existing = db.prepare('SELECT id FROM products WHERE id = ? OR slug = ?').get(p.id, p.slug);
      if (existing) {
        console.log(`Product ${p.id} / ${p.slug} already exists, skipping insertion.`);
        continue;
      }

      insProductStmt.run(
        p.id, p.catId, p.subId, p.name, p.displayName, p.slug,
        p.desc, p.shortDesc, p.productType, p.pricingType,
        p.basePrice, p.startingPrice, p.unit, p.customMade, p.featured,
        p.customMeasurement, p.active, p.displayOrder,
        p.spaceSlugs
      );

      // Insert images
      for (const img of p.images) {
        insImageStmt.run(img.id, p.id, img.url, img.alt, img.order, img.isMain);
      }

      // Insert variants
      for (let i = 0; i < p.variants.length; i++) {
        const v = p.variants[i];
        insVariantStmt.run(v.id, p.id, v.name, v.type, v.sku, v.hex, v.thumb, v.prev, v.adj, v.attrs, i);
      }

      // Insert specifications
      for (let i = 0; i < p.specs.length; i++) {
        const s = p.specs[i];
        insSpecStmt.run(`spec-${p.id}-${i}`, p.id, s.label, s.value, i);
      }

      console.log(`Inserted new curated curtain product: ${p.id} (${p.name})`);
    }

    db.exec('COMMIT;');
    console.log('Curtain Catalog Expansion transaction committed successfully!');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Error during transaction, rolled back:', err);
    throw err;
  }
};

runTransaction();
db.close();
