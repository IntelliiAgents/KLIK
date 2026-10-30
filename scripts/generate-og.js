const sharp = require('sharp');

async function makeOg() {
  const logo = await sharp('public/assets/klik-logo-hero.png')
    .resize({ width: 720, height: 420, fit: 'inside' })
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();

  const svgBg = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#FCFBF7"/>
      <rect x="0" y="0" width="1200" height="14" fill="#263E47"/>
      <rect x="0" y="14" width="1200" height="6" fill="#D75A35"/>
      
      <rect x="0" y="520" width="1200" height="110" fill="#263E47"/>
      <rect x="0" y="514" width="1200" height="6" fill="#D75A35"/>
      
      <text x="600" y="562" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="24" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">
        27–29 NOVEMBER 2026 • KLEINMOND, WESTERN CAPE
      </text>
      <text x="600" y="598" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="16" fill="#E3DAC9" text-anchor="middle" letter-spacing="4">
        STORIES • POETRY • MUSIC • ART • COMMUNITY
      </text>
    </svg>
  `);

  const bg = await sharp(svgBg).png().toBuffer();
  const left = Math.round((1200 - logoMeta.width) / 2);
  const top = Math.round((514 - logoMeta.height) / 2);

  await sharp(bg)
    .composite([
      {
        input: logo,
        top: top,
        left: left,
      }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile('public/og-image.jpg');

  // WhatsApp square 600x600 preview
  const squareLogo = await sharp('public/assets/klik-logo-hero.png')
    .resize({ width: 500, height: 320, fit: 'inside' })
    .toBuffer();
  const squareLogoMeta = await sharp(squareLogo).metadata();

  const squareSvgBg = Buffer.from(`
    <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#FCFBF7"/>
      <rect x="0" y="0" width="600" height="10" fill="#263E47"/>
      <rect x="0" y="10" width="600" height="5" fill="#D75A35"/>
      
      <rect x="0" y="480" width="600" height="120" fill="#263E47"/>
      <rect x="0" y="475" width="600" height="5" fill="#D75A35"/>
      
      <text x="300" y="525" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
        27–29 NOV 2026 • KLEINMOND
      </text>
      <text x="300" y="558" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="12" fill="#E3DAC9" text-anchor="middle" letter-spacing="2">
        STORIES • POETRY • MUSIC • ART
      </text>
    </svg>
  `);

  const squareBg = await sharp(squareSvgBg).png().toBuffer();
  const sqLeft = Math.round((600 - squareLogoMeta.width) / 2);
  const sqTop = Math.round((475 - squareLogoMeta.height) / 2);

  await sharp(squareBg)
    .composite([
      {
        input: squareLogo,
        top: sqTop,
        left: sqLeft,
      }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile('public/og-square.jpg');

  console.log('Successfully created sharp branded social previews');
}

makeOg().catch(console.error);
