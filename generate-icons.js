
const fs = require('fs');

const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http:
  <rect width="${size}" height="${size}" fill="#1e40af" rx="${size/8}"/>
  <circle cx="${size/2}" cy="${size*0.35}" r="${size/8}" fill="#ffffff" opacity="0.3"/>
  <text x="${size/2}" y="${size*0.65}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size/8}" font-weight="bold" fill="#ffffff">MY</text>
  <text x="${size/2}" y="${size*0.8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size/16}" fill="#60a5fa">AFFIRMS</text>
</svg>`;

fs.writeFileSync('./public/icon-192.svg', createSVGIcon(192));
fs.writeFileSync('./public/icon-512.svg', createSVGIcon(512));

console.log('Try: https: