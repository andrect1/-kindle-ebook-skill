/**
 * build_cover_template.js
 *
 * Reusable engine for persuasive KDP covers, following the house style in
 * SKILL.md: SVG -> rsvg-convert -> JPEG, at the recommended KDP size
 * (1600x2560, ratio 1:1.6), with a gradient background, radial glow,
 * vignette, ornamental frame, and a clear content hierarchy:
 *   kicker -> (optional emblem) -> big title -> subtitle -> hook ribbon -> close
 *
 * Requires:
 *   apt-get install -y librsvg2-bin
 *   Fonts copied into ~/.fonts/ + `fc-cache -f` (see assets/fonts in this skill,
 *   or fetch alternatives from raw.githubusercontent.com/google/fonts/main/ofl/...)
 *
 * Usage:
 *   node build_cover_template.js path/to/cover-data.js output.jpg
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const WIDTH = 1600;
const HEIGHT = 2560;

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Wrap a long line into multiple <tspan> lines for SVG <text>
function wrapTspans({ text, x, startY, lineHeight, maxCharsPerLine }) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    const trial = current ? `${current} ${w}` : w;
    if (trial.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);

  return lines
    .map(
      (line, i) =>
        `<tspan x="${x}" y="${startY + i * lineHeight}">${esc(line)}</tspan>`
    )
    .join("\n");
}

function radialGlow({ cx, cy, r, color, opacity }) {
  return `
    <radialGradient id="glow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glow)" />
  `;
}

function ornamentalFrame({ accent, margin = 60 }) {
  const cornerSize = 70;
  const corner = (x, y, rotate) => `
    <g transform="translate(${x},${y}) rotate(${rotate})" stroke="${accent}" stroke-width="3" fill="none" opacity="0.85">
      <path d="M0,${cornerSize} L0,0 L${cornerSize},0" />
      <path d="M0,${cornerSize * 0.5} L${cornerSize * 0.2},${cornerSize * 0.5}" />
      <path d="M${cornerSize * 0.5},0 L${cornerSize * 0.5},${cornerSize * 0.2}" />
    </g>
  `;
  return `
    <rect x="${margin}" y="${margin}" width="${WIDTH - margin * 2}" height="${HEIGHT - margin * 2}"
          fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
    ${corner(margin, margin, 0)}
    ${corner(WIDTH - margin, margin, 90)}
    ${corner(WIDTH - margin, HEIGHT - margin, 180)}
    ${corner(margin, HEIGHT - margin, 270)}
  `;
}

function buildSvg({
  title,
  subtitle,
  kicker,
  hook,
  bgTop = "#1a1300",
  bgBottom = "#3a2a08",
  accent = "#D4AF37",
  titleFont = "Cinzel",
  subtitleFont = "Cormorant Garamond",
  textColor = "#F5EAD0",
}) {
  const titleTspans = wrapTspans({
    text: title.toUpperCase(),
    x: WIDTH / 2,
    startY: HEIGHT * 0.42,
    lineHeight: 118,
    maxCharsPerLine: 14,
  });

  const subtitleTspans = subtitle
    ? wrapTspans({
        text: subtitle,
        x: WIDTH / 2,
        startY: HEIGHT * 0.58,
        lineHeight: 56,
        maxCharsPerLine: 34,
      })
    : "";

  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgTop}"/>
      <stop offset="100%" stop-color="${bgBottom}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  ${radialGlow({ cx: WIDTH / 2, cy: HEIGHT * 0.38, r: WIDTH * 0.65, color: accent, opacity: 0.35 })}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>
  ${ornamentalFrame({ accent })}

  <!-- kicker -->
  <text x="${WIDTH / 2}" y="${HEIGHT * 0.16}" text-anchor="middle"
        font-family="${subtitleFont}" font-size="34" letter-spacing="8"
        fill="${accent}" font-style="italic">${esc((kicker || "").toUpperCase())}</text>

  <!-- title -->
  <text text-anchor="middle" font-family="${titleFont}" font-size="98" font-weight="700"
        fill="${textColor}">
    ${titleTspans}
  </text>

  <!-- subtitle -->
  <text text-anchor="middle" font-family="${subtitleFont}" font-size="42" font-style="italic"
        fill="${textColor}" opacity="0.92">
    ${subtitleTspans}
  </text>

  ${
    hook
      ? `
  <!-- hook ribbon -->
  <rect x="${WIDTH * 0.12}" y="${HEIGHT * 0.78}" width="${WIDTH * 0.76}" height="120"
        fill="${accent}" opacity="0.14" rx="4"/>
  <rect x="${WIDTH * 0.12}" y="${HEIGHT * 0.78}" width="${WIDTH * 0.76}" height="120"
        fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.8" rx="4"/>
  <text x="${WIDTH / 2}" y="${HEIGHT * 0.78 + 70}" text-anchor="middle"
        font-family="${subtitleFont}" font-size="34" font-style="italic"
        fill="${textColor}">${esc(hook)}</text>
  `
      : ""
  }

  <!-- decorative close -->
  <text x="${WIDTH / 2}" y="${HEIGHT * 0.94}" text-anchor="middle"
        font-family="${subtitleFont}" font-size="30" letter-spacing="6"
        fill="${accent}" opacity="0.85">§</text>
</svg>
  `.trim();
}

function build(coverData, outPath) {
  const svg = buildSvg(coverData);
  const tmpSvg = outPath.replace(/\.(jpg|jpeg|png)$/i, "") + ".svg";
  const tmpPng = outPath.replace(/\.(jpg|jpeg|png)$/i, "") + ".png";
  fs.writeFileSync(tmpSvg, svg);

  execSync(`rsvg-convert -w ${WIDTH} -h ${HEIGHT} "${tmpSvg}" -o "${tmpPng}"`);

  if (/\.jpe?g$/i.test(outPath)) {
    execSync(`convert "${tmpPng}" -quality 92 "${outPath}"`);
  } else {
    fs.copyFileSync(tmpPng, outPath);
  }

  return outPath;
}

// ---------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------

if (require.main === module) {
  const dataPath = process.argv[2];
  const outPath = process.argv[3] || "cover.jpg";
  if (!dataPath) {
    console.error("Usage: node build_cover_template.js path/to/cover-data.js output.jpg");
    process.exit(1);
  }
  const data = require(path.resolve(dataPath));
  const result = build(data, outPath);
  console.log(`Capa gerada: ${result} (${WIDTH}x${HEIGHT}px)`);
  console.log("Lembrete: confira visualmente em tamanho real antes de entregar.");
}

module.exports = { build, buildSvg, WIDTH, HEIGHT };
