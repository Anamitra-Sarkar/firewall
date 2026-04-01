/**
 * AI-NGFW Icon Generator
 * Generates extension icons in various sizes
 * Run with: node generate-icons.js
 */

const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const OUTPUT_DIR = __dirname;

/**
 * Create gradient icon
 */
function createIcon(size) {
  const cvs = canvas.createCanvas(size, size);
  const ctx = cvs.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#06b6d4');

  // Draw circle
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
  ctx.fill();

  // Draw shield outline for 48px and larger
  if (size >= 48) {
    const shieldX = size / 2;
    const shieldY = size / 2;
    const shieldWidth = size / 3;
    const shieldHeight = size / 2.5;

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = Math.max(1, size / 32);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Shield path
    ctx.beginPath();
    ctx.moveTo(shieldX - shieldWidth / 2, shieldY - shieldHeight / 3);
    ctx.lineTo(shieldX - shieldWidth / 2, shieldY);
    ctx.quadraticCurveTo(shieldX, shieldY + shieldHeight / 2, shieldX, shieldY + shieldHeight / 2);
    ctx.quadraticCurveTo(shieldX, shieldY + shieldHeight / 2, shieldX + shieldWidth / 2, shieldY);
    ctx.lineTo(shieldX + shieldWidth / 2, shieldY - shieldHeight / 3);
    ctx.closePath();
    ctx.stroke();
  }

  // Draw checkmark for 48px and larger
  if (size >= 48) {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = Math.max(2, size / 16);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const checkSize = size / 4;
    ctx.beginPath();
    ctx.moveTo(size / 2 - checkSize / 2, size / 2);
    ctx.lineTo(size / 2 - checkSize / 4, size / 2 + checkSize / 3);
    ctx.lineTo(size / 2 + checkSize / 3, size / 2 - checkSize / 3);
    ctx.stroke();
  }

  return cvs;
}

/**
 * Generate all icon sizes
 */
function generateIcons() {
  console.log('[AI-NGFW] Generating extension icons...');

  sizes.forEach((size) => {
    try {
      const cvs = createIcon(size);
      const filename = path.join(OUTPUT_DIR, `icon-${size}.png`);
      const out = fs.createWriteStream(filename);

      cvs.pngStream().pipe(out);

      out.on('finish', () => {
        console.log(`✓ Generated icon-${size}.png`);
      });

      out.on('error', (err) => {
        console.error(`✗ Error writing icon-${size}.png:`, err);
      });
    } catch (error) {
      console.error(`✗ Error generating icon-${size}.png:`, error);
    }
  });

  console.log('Icon generation complete!');
}

// Run generation
generateIcons();
