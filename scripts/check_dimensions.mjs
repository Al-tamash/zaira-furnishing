import fs from 'fs';

function getJpegDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  let i = 4;
  while (i < buf.length) {
    const marker = buf.readUInt16BE(i);
    const len = buf.readUInt16BE(i + 2);
    if ((marker >= 0xffc0 && marker <= 0xffc3) || (marker >= 0xffc5 && marker <= 0xffc7) || (marker >= 0xffc9 && marker <= 0xffcb) || (marker >= 0xffcd && marker <= 0xffcf)) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    i += 2 + len;
  }
  return null;
}

const testFiles = [
  'public/images/products/curtains/kids-room-curtains/main.jpg',
  'public/images/products/curtains/embroidered-curtains/main.jpg',
  'public/images/products/curtains/digitally-printed-curtains/main.jpg',
  'public/images/products/curtains/linen-textured-curtains/main.jpg',
  'public/images/products/curtains/custom-made-curtains/main.jpg',
];

for (const f of testFiles) {
  console.log(f, getJpegDimensions(f));
}
