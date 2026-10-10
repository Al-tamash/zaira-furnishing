import fs from 'fs';
import sharp from 'sharp';

async function processCurtainImages() {
  console.log('Processing curtain images with sharp...');

  // 1. Linen fabric detail crop from linen-textured-curtains/main.jpg
  // main.jpg is 928x1152. Center right has detailed linen drapery folds.
  await sharp('public/images/products/curtains/linen-textured-curtains/main.jpg')
    .extract({ left: 300, top: 400, width: 450, height: 450 })
    .resize(800, 800)
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/linen-textured-curtains/fabric-detail.jpg');
  console.log('Created linen fabric-detail.jpg');

  // 2. Printed fabric detail crop and Indigo colorway
  // The floral motif is prominent on the left and middle curtain
  await sharp('public/images/products/curtains/digitally-printed-curtains/main.jpg')
    .extract({ left: 80, top: 280, width: 480, height: 480 })
    .resize(800, 800)
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/digitally-printed-curtains/fabric-detail.jpg');
  console.log('Created printed fabric-detail.jpg');

  // Create Indigo Flora variant (hue-rotate ~150 deg for cool indigo / teal tones)
  await sharp('public/images/products/curtains/digitally-printed-curtains/main.jpg')
    .modulate({ hue: 155, saturation: 1.1 })
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/digitally-printed-curtains/indigo-flora.jpg');
  console.log('Created printed indigo-flora.jpg');

  // 3. Embroidered fabric detail crop and Silver Vine variant
  // The floral border embroidery is prominent on the left border (left: 200, top: 180)
  await sharp('public/images/products/curtains/embroidered-curtains/main.jpg')
    .extract({ left: 200, top: 220, width: 420, height: 420 })
    .resize(800, 800)
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/embroidered-curtains/fabric-detail.jpg');
  console.log('Created embroidered fabric-detail.jpg');

  // Silver Vine variant (slightly desaturated cool platinum tone)
  await sharp('public/images/products/curtains/embroidered-curtains/main.jpg')
    .modulate({ saturation: 0.25, brightness: 1.05 })
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/embroidered-curtains/silver-vine.jpg');
  console.log('Created embroidered silver-vine.jpg');

  // 4. Kids star motif crop, Blush Pink variant, and Sky Blue variant
  await sharp('public/images/products/curtains/kids-room-curtains/main.jpg')
    .extract({ left: 100, top: 200, width: 450, height: 450 })
    .resize(800, 800)
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/kids-room-curtains/fabric-detail.jpg');
  console.log('Created kids fabric-detail.jpg');

  // Blush Pink variant
  await sharp('public/images/products/curtains/kids-room-curtains/main.jpg')
    .tint({ r: 245, g: 215, b: 215 })
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/kids-room-curtains/blush-dreams.jpg');
  console.log('Created kids blush-dreams.jpg');

  // Sky Blue variant
  await sharp('public/images/products/curtains/kids-room-curtains/main.jpg')
    .tint({ r: 215, g: 232, b: 245 })
    .jpeg({ quality: 92 })
    .toFile('public/images/products/curtains/kids-room-curtains/sky-blue.jpg');
  console.log('Created kids sky-blue.jpg');

  // 5. Custom made curtains atelier craft & swatches
  fs.copyFileSync(
    'public/images/services/custom-stitching.jpg',
    'public/images/products/curtains/custom-made-curtains/atelier-craft.jpg'
  );
  fs.copyFileSync(
    'public/images/services/fabric-samples-at-home.jpg',
    'public/images/products/curtains/custom-made-curtains/fabric-swatches.jpg'
  );
  fs.copyFileSync(
    'public/images/services/free-home-measurement.jpg',
    'public/images/products/curtains/custom-made-curtains/laser-measurement.jpg'
  );
  console.log('Copied custom-made-curtains service imagery');

  console.log('All image processing complete!');
}

processCurtainImages().catch(console.error);
