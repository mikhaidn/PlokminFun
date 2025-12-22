import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// Create a simple FreeCell icon SVG
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#2c5f2d" rx="${size * 0.1}"/>

  <!-- Playing card -->
  <rect x="${size * 0.2}" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.7}"
        fill="white" rx="${size * 0.05}" stroke="#1a3a1b" stroke-width="${size * 0.02}"/>

  <!-- Spade symbol -->
  <g transform="translate(${size * 0.5}, ${size * 0.45})">
    <!-- Heart of spade -->
    <circle cx="${-size * 0.06}" cy="${-size * 0.02}" r="${size * 0.08}" fill="#000"/>
    <circle cx="${size * 0.06}" cy="${-size * 0.02}" r="${size * 0.08}" fill="#000"/>
    <!-- Point of spade -->
    <path d="M 0,${-size * 0.15} L ${size * 0.12},${size * 0.05} L ${-size * 0.12},${size * 0.05} Z" fill="#000"/>
    <!-- Stem -->
    <rect x="${-size * 0.02}" y="${size * 0.05}" width="${size * 0.04}" height="${size * 0.08}" fill="#000"/>
  </g>

  <!-- Text "FC" -->
  <text x="${size * 0.5}" y="${size * 0.85}"
        font-family="Arial, sans-serif"
        font-size="${size * 0.15}"
        font-weight="bold"
        fill="white"
        text-anchor="middle">FC</text>
</svg>
`;

async function generateIcons() {
  try {
    // Generate 192x192 icon
    const svg192 = Buffer.from(createIconSVG(192));
    await sharp(svg192)
      .png()
      .toFile(join(publicDir, 'icon-192.png'));
    console.log('✓ Generated icon-192.png');

    // Generate 512x512 icon
    const svg512 = Buffer.from(createIconSVG(512));
    await sharp(svg512)
      .png()
      .toFile(join(publicDir, 'icon-512.png'));
    console.log('✓ Generated icon-512.png');

    console.log('\nIcons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
