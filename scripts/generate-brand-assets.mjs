import sharp from "sharp";

async function generateAssets() {
  // 1. Favicon / Icon (64x64 -> icon.png)
  const iconSvg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0D0B09"/>
      <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#26221D" stroke-width="2"/>
      <text x="32" y="44" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" text-anchor="middle" fill="#D8BC87">Y</text>
    </svg>
  `;
  await sharp(Buffer.from(iconSvg)).png().toFile("app/icon.png");
  console.log("Generated app/icon.png");

  // 2. Apple Touch Icon (180x180 -> apple-icon.png)
  const appleIconSvg = `
    <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" rx="40" fill="#0D0B09"/>
      <rect x="2" y="2" width="176" height="176" rx="38" fill="none" stroke="#26221D" stroke-width="4"/>
      <text x="50" y="112" font-family="monospace" font-weight="400" font-size="64" fill="#525E78">&#123;</text>
      <text x="90" y="116" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="76" text-anchor="middle" fill="#D8BC87">Y</text>
      <text x="130" y="112" font-family="monospace" font-weight="400" font-size="64" fill="#525E78">&#125;</text>
    </svg>
  `;
  await sharp(Buffer.from(appleIconSvg)).png().toFile("app/apple-icon.png");
  console.log("Generated app/apple-icon.png");

  // 3. OpenGraph and Twitter Image (1200x630)
  const ogSvg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="60%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#221D16" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0D0B09" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#glow)"/>
      <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="#26221D" stroke-width="2"/>
      
      <!-- Top Badge -->
      <rect x="90" y="90" width="370" height="38" rx="6" fill="#1C1814" stroke="#D8BC87" stroke-opacity="0.3" stroke-width="1"/>
      <text x="110" y="114" font-family="monospace" font-size="14" font-weight="600" fill="#D8BC87" letter-spacing="2">RUST &amp; OPEN-SOURCE DEVELOPER</text>
      
      <!-- Monogram in corner -->
      <text x="1070" y="130" font-family="monospace" font-size="44" font-weight="600" text-anchor="end" fill="#525E78">{ <tspan fill="#D8BC87">Y</tspan> }</text>

      <!-- Main Headline -->
      <text x="90" y="240" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="76" fill="#F4EFE6" letter-spacing="-1.5">Yatin Mishra</text>

      <!-- Tagline / Bio -->
      <text x="90" y="320" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="28" fill="#C9BFA8">
        Second-year CS @ Ramdeobaba University, Nagpur · Class of 2029
      </text>
      <text x="90" y="365" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="24" fill="#8C8270">
        Fast async CLI tools in Rust · 400+ security tools · GirlScript Summer of Code
      </text>

      <!-- Bottom metadata -->
      <line x1="90" y1="460" x2="1110" y2="460" stroke="#26221D" stroke-width="1"/>
      <text x="90" y="515" font-family="monospace" font-size="18" fill="#D8BC87">github.com/DamnYatin</text>
      <text x="430" y="515" font-family="monospace" font-size="18" fill="#A89F8D">linkedin.com/in/yatinmishra1</text>
      <text x="1110" y="515" font-family="monospace" font-size="18" text-anchor="end" fill="#525E78">Nagpur, India (GMT+5:30)</text>
    </svg>
  `;
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 92 }).toFile("app/opengraph-image.jpeg");
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 92 }).toFile("app/twitter-image.jpeg");
  console.log("Generated app/opengraph-image.jpeg and app/twitter-image.jpeg");
}

generateAssets().catch(console.error);
