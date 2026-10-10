import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\mkaly\\.gemini\\antigravity-ide\\brain\\aad2b036-a87d-4aa0-96cc-1d935d645546';

// List brain images
const brainFiles = fs.readdirSync(brainDir).filter(f => f.endsWith('.jpg'));
console.log('Brain JPG files:', brainFiles);

// Copy generated images to public/images/products/curtains
const copyMap = [
  // Sheer
  { src: brainFiles.find(f => f.startsWith('sheer_ivory_voile')), dest: 'public/images/products/curtains/sheer-day-curtains/ivory-voile.jpg' },
  { src: brainFiles.find(f => f.startsWith('sheer_champagne_room')), dest: 'public/images/products/curtains/sheer-day-curtains/champagne-room.jpg' },
  { src: brainFiles.find(f => f.startsWith('sheer_fabric_detail')), dest: 'public/images/products/curtains/sheer-day-curtains/fabric-detail.jpg' },

  // Velvet
  { src: brainFiles.find(f => f.startsWith('velvet_royal_emerald')), dest: 'public/images/products/curtains/velvet-curtains/royal-emerald.jpg' },
  { src: brainFiles.find(f => f.startsWith('velvet_prussian_navy')), dest: 'public/images/products/curtains/velvet-curtains/prussian-navy.jpg' },
  { src: brainFiles.find(f => f.startsWith('velvet_fabric_detail')), dest: 'public/images/products/curtains/velvet-curtains/fabric-detail.jpg' },

  // Satin
  { src: brainFiles.find(f => f.startsWith('satin_pearl_oyster')), dest: 'public/images/products/curtains/satin-plain-curtains/pearl-oyster.jpg' },
  { src: brainFiles.find(f => f.startsWith('satin_champagne_gold')), dest: 'public/images/products/curtains/satin-plain-curtains/champagne-gold.jpg' },
  { src: brainFiles.find(f => f.startsWith('satin_fabric_detail')), dest: 'public/images/products/curtains/satin-plain-curtains/fabric-detail.jpg' },

  // Jacquard
  { src: brainFiles.find(f => f.startsWith('jacquard_heritage_damask')), dest: 'public/images/products/curtains/jacquard-curtains/heritage-damask.jpg' },
  { src: brainFiles.find(f => f.startsWith('jacquard_geometric_modern')), dest: 'public/images/products/curtains/jacquard-curtains/geometric-modern.jpg' },
  { src: brainFiles.find(f => f.startsWith('jacquard_fabric_detail')), dest: 'public/images/products/curtains/jacquard-curtains/fabric-detail.jpg' },

  // Linen
  { src: brainFiles.find(f => f.startsWith('linen_pure_flax_oatmeal')), dest: 'public/images/products/curtains/linen-textured-curtains/pure-flax-oatmeal.jpg' },
];

for (const item of copyMap) {
  if (item.src) {
    const srcPath = path.join(brainDir, item.src);
    fs.copyFileSync(srcPath, item.dest);
    console.log(`Copied ${item.src} -> ${item.dest}`);
  } else {
    console.warn(`Missing source for ${item.dest}`);
  }
}
