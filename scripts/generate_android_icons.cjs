const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceIcon = path.join(__dirname, '../play_store_assets/00_app_icon_512x512.png');
const resDir = path.join(__dirname, '../android/app/src/main/res');
const artDir = 'C:/Users/PABLO MORALES/.gemini/antigravity-ide/brain/b47cf88c-1952-4525-9397-fd76fdfad3c9';

const densities = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 }
];

async function generateAllIcons() {
  console.log('Generating Android native launcher icons from:', sourceIcon);

  for (const d of densities) {
    const targetFolder = path.join(resDir, d.folder);
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

    // 1. Standard square/rounded legacy icon
    await sharp(sourceIcon)
      .resize(d.size, d.size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // 2. Round legacy icon
    const radius = d.size / 2;
    const circleMask = Buffer.from(
      `<svg width="${d.size}" height="${d.size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff"/></svg>`
    );
    await sharp(sourceIcon)
      .resize(d.size, d.size)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // 3. Adaptive Foreground Icon (scaled to fit safe zone 66%)
    const innerSize = Math.round(d.fgSize * 0.72);
    const innerIcon = await sharp(sourceIcon)
      .resize(innerSize, innerSize)
      .toBuffer();

    const padding = Math.round((d.fgSize - innerSize) / 2);

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 10, g: 10, b: 10, alpha: 0 }
      }
    })
      .composite([{
        input: innerIcon,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`✓ ${d.folder}: ic_launcher (${d.size}x${d.size}), ic_launcher_round, ic_launcher_foreground (${d.fgSize}x${d.fgSize})`);
  }

  // Also create showcase mockup for the user:
  // 1) Squircle preview (Samsung / Xiaomi style)
  // 2) Circle preview (Google Pixel style)
  // 3) Full store preview (512x512)
  const previewSize = 512;
  const squircleSvg = Buffer.from(`
    <svg width="${previewSize}" height="${previewSize}">
      <rect x="0" y="0" width="${previewSize}" height="${previewSize}" rx="112" ry="112" fill="#ffffff"/>
    </svg>
  `);

  await sharp(sourceIcon)
    .resize(previewSize, previewSize)
    .composite([{ input: squircleSvg, blend: 'dest-in' }])
    .png()
    .toFile(path.join(artDir, 'phone_squircle_icon.png'));

  const circleSvg = Buffer.from(`
    <svg width="${previewSize}" height="${previewSize}">
      <circle cx="${previewSize/2}" cy="${previewSize/2}" r="${previewSize/2}" fill="#ffffff"/>
    </svg>
  `);

  await sharp(sourceIcon)
    .resize(previewSize, previewSize)
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toFile(path.join(artDir, 'phone_circle_icon.png'));

  // Also copy raw 512x512 icon
  fs.copyFileSync(sourceIcon, path.join(artDir, 'store_icon_512.png'));

  console.log('All icons and previews generated successfully!');
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
