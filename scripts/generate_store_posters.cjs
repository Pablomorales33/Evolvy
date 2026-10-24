const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WIDTH = 1080;
const HEIGHT = 1920;

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const POSTERS_DATA = [
  {
    filename: '01_poster_dashboard.png',
    screenshot: '01_dashboard_home.png',
    badge: '⚡ EVOLVY FITNESS PROTOCOL',
    headline: 'CRUSH EVERY WORKOUT',
    subtitle: 'Tailored daily programs built for maximum progressive overload',
    accentColor: '#d7ff00',
  },
  {
    filename: '02_poster_workout_player.png',
    screenshot: '02_active_workout_player.png',
    badge: '🔥 SMART WORKOUT PLAYER',
    headline: 'LOG SETS IN REAL TIME',
    subtitle: 'Zero-friction tracking with interval timers &amp; target RPE',
    accentColor: '#00a2ff',
  },
  {
    filename: '03_poster_coach_chat.png',
    screenshot: '03_ai_routines.png',
    badge: '🧠 24/7 AI COACH IN YOUR CORNER',
    headline: 'EXPERT FITNESS COACHING',
    subtitle: 'Form tips, custom progression plans &amp; weekly video briefs',
    accentColor: '#d7ff00',
  },
  {
    filename: '04_poster_recovery.png',
    screenshot: '04_muscle_recovery.png',
    badge: '📊 RECOVERY &amp; SQUAD ENERGY',
    headline: 'OPTIMIZE RECOVERY',
    subtitle: 'Track readiness scores and send live cheers to teammates',
    accentColor: '#00a2ff',
  },
  {
    filename: '05_poster_athlete_pro.png',
    screenshot: '05_evolvy_pro.png',
    badge: '🏆 TROPHY CASE &amp; MILESTONES',
    headline: 'PROVE YOUR EVOLUTION',
    subtitle: 'Celebrate personal records, volume streaks &amp; verified Pro status',
    accentColor: '#d7ff00',
  },
];

async function generatePoster(data) {
  const screenshotPath = path.join(__dirname, '../play_store_assets/screenshots', data.screenshot);
  const outputPath = path.join(__dirname, '../play_store_assets/posters', data.filename);

  // Exact math to preserve 100% of screenshot without horizontal or vertical cropping
  // Screenshot is 627 x 985 -> aspect ratio = 0.636548
  const screenW = 860;
  const screenH = 1350; // 860 / (627/985) = ~1351
  const screenRadius = 38;

  const bezelPad = 12;
  const phoneW = screenW + bezelPad * 2; // 884
  const phoneH = screenH + bezelPad * 2; // 1374
  const phoneX = Math.round((WIDTH - phoneW) / 2); // 98
  const phoneY = 415;
  const screenX = phoneX + bezelPad;
  const screenY = phoneY + bezelPad;

  // 1. Process screenshot: resize cleanly without cropping
  const screenMaskSvg = `
    <svg width="${screenW}" height="${screenH}">
      <rect x="0" y="0" width="${screenW}" height="${screenH}" rx="${screenRadius}" ry="${screenRadius}" fill="#fff"/>
    </svg>
  `;

  const resizedScreenshot = await sharp(screenshotPath)
    .resize(screenW, screenH, { fit: 'fill' })
    .composite([{ input: Buffer.from(screenMaskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Build Phone Frame with 3D drop shadow
  const phoneFrameSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="phoneShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.85"/>
          <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="${data.accentColor}" flood-opacity="0.28"/>
        </filter>
        <linearGradient id="chassisGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2c333a"/>
          <stop offset="50%" stop-color="#14181c"/>
          <stop offset="100%" stop-color="#2c333a"/>
        </linearGradient>
      </defs>

      <!-- Outer Titanium Chassis with glow shadow -->
      <rect x="${phoneX}" y="${phoneY}" width="${phoneW}" height="${phoneH}" rx="48" ry="48" fill="url(#chassisGrad)" stroke="#38434e" stroke-width="2.5" filter="url(#phoneShadow)" />

      <!-- Inner bezel stroke -->
      <rect x="${screenX - 1}" y="${screenY - 1}" width="${screenW + 2}" height="${screenH + 2}" rx="${screenRadius + 1}" ry="${screenRadius + 1}" fill="none" stroke="#000000" stroke-width="2.5"/>
    </svg>
  `;

  // 3. Dynamic Island Pill Overlay
  const dynamicIslandSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${WIDTH / 2 - 60}" y="${screenY + 12}" width="120" height="26" rx="13" ry="13" fill="#000000" />
      <circle cx="${WIDTH / 2 + 35}" cy="${screenY + 25}" r="4.5" fill="#111827" />
    </svg>
  `;

  // 4. Background and Typography SVG
  const backgroundSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="16%" r="65%">
          <stop offset="0%" stop-color="${data.accentColor}" stop-opacity="0.22"/>
          <stop offset="42%" stop-color="#0e1318" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#06080a" stop-opacity="1"/>
        </radialGradient>
        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="#ffffff" fill-opacity="0.04"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGlow)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gridPattern)"/>

      <!-- Eyebrow Pill -->
      <g transform="translate(${WIDTH / 2}, 125)">
        <rect x="-210" y="-22" width="420" height="44" rx="22" ry="22" fill="#090e13" stroke="${data.accentColor}" stroke-opacity="0.45" stroke-width="1.5"/>
        <text x="0" y="6" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="16" font-weight="800" fill="${data.accentColor}" text-anchor="middle" letter-spacing="2">
          ${data.badge}
        </text>
      </g>

      <!-- Main Headline -->
      <text x="${WIDTH / 2}" y="235" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="62" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ${data.headline}
      </text>

      <!-- Subtitle -->
      <text x="${WIDTH / 2}" y="305" font-family="'Inter', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="600" fill="#cbd5e1" text-anchor="middle">
        ${data.subtitle}
      </text>

      <!-- Bottom Branding -->
      <text x="${WIDTH / 2}" y="${HEIGHT - 45}" font-family="'Montserrat', 'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="4">
        EVOLVY FITNESS • AI PROGRESSIVE OVERLOAD
      </text>
    </svg>
  `;

  // Composite layers together
  await sharp(Buffer.from(backgroundSvg))
    .composite([
      { input: Buffer.from(phoneFrameSvg), left: 0, top: 0 },
      { input: resizedScreenshot, left: screenX, top: screenY },
      { input: Buffer.from(dynamicIslandSvg), left: 0, top: 0 }
    ])
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log(`Generated: ${outputPath}`);
}

async function generateFeatureGraphic() {
  const outputPath = path.join(__dirname, '../play_store_assets/posters/00_feature_graphic_1024x500.png');
  const iconPath = path.join(__dirname, '../public/images/evolvy-icon.png');
  const workoutScreenPath = path.join(__dirname, '../play_store_assets/screenshots/02_active_workout_player.png');

  const FG_WIDTH = 1024;
  const FG_HEIGHT = 500;

  // Mini phone mockup on the right
  const miniScreenW = 300;
  const miniScreenH = 460;
  const miniRadius = 26;

  const resizedMiniScreen = await sharp(workoutScreenPath)
    .resize(miniScreenW, miniScreenH, { fit: 'fill' })
    .composite([{
      input: Buffer.from(`
        <svg width="${miniScreenW}" height="${miniScreenH}">
          <rect width="${miniScreenW}" height="${miniScreenH}" rx="${miniRadius}" fill="#fff"/>
        </svg>
      `),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  const iconSize = 92;
  const resizedIcon = await sharp(iconPath)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  const featureSvg = `
    <svg width="${FG_WIDTH}" height="${FG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fgGlow" cx="25%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#d7ff00" stop-opacity="0.25"/>
          <stop offset="50%" stop-color="#0a1015" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#050709" stop-opacity="1"/>
        </radialGradient>
        <radialGradient id="phoneGlow" cx="80%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#00a2ff" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Backgrounds -->
      <rect width="${FG_WIDTH}" height="${FG_HEIGHT}" fill="url(#fgGlow)"/>
      <rect width="${FG_WIDTH}" height="${FG_HEIGHT}" fill="url(#phoneGlow)"/>

      <!-- Eyebrow Pill -->
      <g transform="translate(60, 50)">
        <rect x="0" y="0" width="240" height="32" rx="16" fill="#0d141a" stroke="#d7ff00" stroke-width="1.2" stroke-opacity="0.6"/>
        <text x="120" y="21" font-family="'Montserrat', sans-serif" font-size="12" font-weight="800" fill="#d7ff00" text-anchor="middle" letter-spacing="2">
          ⚡ NEXT-GEN FITNESS
        </text>
      </g>

      <!-- Brand Name next to Icon -->
      <text x="175" y="155" font-family="'Montserrat', 'Impact', sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="3">
        EVOLVY
      </text>

      <!-- Tagline -->
      <text x="175" y="185" font-family="'Montserrat', sans-serif" font-size="15" font-weight="800" fill="#d7ff00" letter-spacing="3">
        TRAIN • EVOLVE • REPEAT
      </text>

      <!-- Subtitle description -->
      <text x="60" y="244" font-family="'Montserrat', 'Inter', sans-serif" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="0.5">
        AI Workout Log &amp; Muscle Analytics
      </text>
      <text x="60" y="274" font-family="'Inter', sans-serif" font-size="15" font-weight="400" fill="#94a3b8">
        Smart progressive overload engine built for serious lifters.
      </text>

      <!-- Feature Badges -->
      <g transform="translate(60, 325)">
        <rect x="0" y="0" width="145" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
        <text x="72" y="22" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">✓ 24/7 AI Coach</text>

        <rect x="155" y="0" width="165" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
        <text x="237" y="22" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">✓ Auto Rest Timers</text>

        <rect x="330" y="0" width="175" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
        <text x="417" y="22" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">✓ Muscle Recovery Map</text>
      </g>

      <!-- Bottom Platform Support -->
      <text x="60" y="420" font-family="'Inter', sans-serif" font-size="13" font-weight="600" fill="#64748b" letter-spacing="1">
        AVAILABLE ON GOOGLE PLAY &amp; APPLE APP STORE
      </text>

      <!-- Right Phone Chassis Backdrop -->
      <rect x="655" y="30" width="320" height="480" rx="36" fill="#14181e" stroke="#2d3748" stroke-width="2.5"/>
    </svg>
  `;

  await sharp(Buffer.from(featureSvg))
    .composite([
      // Icon
      { input: resizedIcon, left: 60, top: 105 },
      // Phone screen
      { input: resizedMiniScreen, left: 665, top: 40 }
    ])
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log(`Generated Feature Graphic: ${outputPath}`);
}

async function main() {
  console.log('Generating 5 Pixel-Perfect Store Posters (1080x1920)...');
  for (const data of POSTERS_DATA) {
    await generatePoster(data);
  }
  console.log('Generating Feature Graphic (1024x500)...');
  await generateFeatureGraphic();
  console.log('All store assets successfully created!');
}

main().catch(err => {
  console.error('Error generating posters:', err);
  process.exit(1);
});
