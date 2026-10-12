export interface CategoryBannerConfig {
  kicker: string;
  shopByTypeTagline: string;
  description: string;
  bannerKicker: string;
  bannerTitle: string;
  bannerDescription: string;
  whatsappPrompt: string;
}

const DEFAULT_BANNER: CategoryBannerConfig = {
  kicker: 'Atelier Furnishings',
  shopByTypeTagline: 'Shop by Collection',
  description: 'Explore our tailored collections, architectural finishes, and bespoke installations.',
  bannerKicker: 'Hyderabad Showroom & In-Home Visits',
  bannerTitle: 'Experience Our Collections in Person',
  bannerDescription: 'Visit our studio to experience materials firsthand, or schedule a complimentary site measurement.',
  whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about your furnishings.',
};

const CATEGORY_BANNERS: Record<string, CategoryBannerConfig> = {
  'curtains-drapes': {
    kicker: 'Window Treatments',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a curtain style below to explore our tailored collections, light-filtering fabrics, and bespoke heading options.',
    bannerKicker: 'Bespoke Drapery Tailoring',
    bannerTitle: 'Custom Headings & Motorized Tracks',
    bannerDescription: 'We measure, stitch, and install custom motorized ripplefold and pinch pleat curtains tailored to your ceiling height.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about bespoke curtains and drapes.',
  },
  'window-blinds-shades': {
    kicker: 'Architectural Shading',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a blind style below to explore our precision solar screens, day & night shades, and natural wooden louvers.',
    bannerKicker: 'Smart Shading Automation',
    bannerTitle: 'Motorized Somfy & Tuya Solutions',
    bannerDescription: 'Automate your window blinds with whisper-quiet motors, smartphone app scheduling, and smart home integration.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about window blinds and automated shades.',
  },
  'sofa-fabrics-upholstery': {
    kicker: 'Upholstery Textiles',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a textile below to explore our tactile Italian bouclés, washed linens, performance velvets, and textured weaves.',
    bannerKicker: 'Re-Upholstery Atelier',
    bannerTitle: 'Bespoke Re-Upholstery & Cut-Length Orders',
    bannerDescription: 'We supply high-performance fabrics by the meter and provide full sofa refurbishment, foam upgrading, and custom piping in Hyderabad.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about sofa fabrics and re-upholstery.',
  },
  'wallpapers-wall-coverings': {
    kicker: 'Artisanal Wall Finishes',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a wall covering below to explore botanical illustrations, handwoven grasscloth, scenic panoramic murals, and silk panels.',
    bannerKicker: 'Scale-Calibrated Murals',
    bannerTitle: 'Custom Wall Dimensions & Professional Hanging',
    bannerDescription: 'We crop and calibrate scenic murals to match your exact room architecture, with seamless joins and expert installation.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about wallpapers and wall murals.',
  },
  'carpets-rugs': {
    kicker: 'Fine Floorcoverings',
    shopByTypeTagline: 'Shop by Type',
    description: 'Choose a carpet or rug style below to explore our hand-tufted wool blends, heirloom hand-knotted pieces, and seamless broadlooms.',
    bannerKicker: 'Custom Weaving Commissions',
    bannerTitle: 'Custom Dimensions & Color Matching',
    bannerDescription: 'We weave area rugs and broadlooms to match your living room proportions, with bespoke New Zealand wool and bamboo silk yarn dyeing.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about custom carpets and rugs.',
  },
  'mattresses-sleep-systems': {
    kicker: 'Ergonomic Sleep Systems',
    shopByTypeTagline: 'Shop by Collection',
    description: 'Discover orthopedic contouring mattresses, breathable organic latex, and zero-partner-disturbance pocket spring systems.',
    bannerKicker: 'Custom Bedding & Comfort Trials',
    bannerTitle: 'Engineered for Restorative Sleep',
    bannerDescription: 'Experience our mattress firmness levels in our Hyderabad studio or consult with our sleep specialist for bespoke dimensions.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about custom mattresses and sleep systems.',
  },
  'wooden-flooring-sports-floor': {
    kicker: 'Architectural Hardwood & Surfaces',
    shopByTypeTagline: 'Shop by Collection',
    description: 'Explore engineered European oak planks, classical herringbone parquet, and high-impact athletic flooring.',
    bannerKicker: 'Expert Site Preparation & Fitting',
    bannerTitle: 'Precision Hardwood Installation',
    bannerDescription: 'Our certified installers manage moisture barrier damp-proofing, acoustic underlayment, and dust-free hardwood fitting.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about wooden flooring and installation.',
  },
  'bed-linen-bath': {
    kicker: 'Luxury Bed & Bath Linens',
    shopByTypeTagline: 'Shop by Collection',
    description: 'Discover 800TC Egyptian cotton sateen sheets, breathable Belgian linen duvet sets, and ultra-plush Turkish bath towels.',
    bannerKicker: 'Atelier Monogramming & Hospitality Sizing',
    bannerTitle: 'Tailored Luxury for the Bed & Bath',
    bannerDescription: 'Elevate your everyday routine with bespoke monograms and custom bed dimensions designed for deep mattresses.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about luxury bed and bath linen.',
  },
  'cushions-pillows': {
    kicker: 'Curated Textile Accents',
    shopByTypeTagline: 'Shop by Collection',
    description: 'Explore hand-embroidered cushions, tactile textured bolster pillows, and premium microfibre down-alternative inserts.',
    bannerKicker: 'Custom Accent Styling & Piping',
    bannerTitle: 'Bespoke Accent Pillows & Color Coordination',
    bannerDescription: 'Work with our design team to color-match cushions to your drapery and sofa upholstery for cohesive interior harmony.',
    whatsappPrompt: 'Hello Zaira Furnishing, I would like to consult about decorative cushions and pillows.',
  },
};

export function getCategoryBannerConfig(categorySlug: string): CategoryBannerConfig {
  return CATEGORY_BANNERS[categorySlug] || DEFAULT_BANNER;
}
