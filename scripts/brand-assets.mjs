/**
 * Generates every brand derivative from one source logotype.
 *
 *   npm run brand
 *
 * Input:  public/brand/pgsa-logo-source.{jpg,png}  — the supplied artwork
 * Output: pgsa-logo.png      full lockup, transparent background
 *         pgsa-wordmark.png  "PGSA" alone, tagline removed
 *         favicon-16.png, favicon-32.png, apple-touch-icon.png
 *         og-image.png       1200x630 link-preview card
 *
 * Everything here is derived. Only the source file is hand-managed; re-run this
 * whenever it changes.
 */

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BRAND_DIR = path.resolve("public/brand");
const CANDIDATES = [
  "pgsa-logo-source.png",
  "pgsa-logo-source.jpg",
  "pgsa-logo-source.jpeg",
];

const source =
  process.argv[2] ??
  CANDIDATES.map((name) => path.join(BRAND_DIR, name)).find((p) =>
    existsSync(p),
  );

if (!source || !existsSync(source)) {
  console.error(
    `\nNo source logo found.\n\n` +
      `Save the artwork as public/brand/pgsa-logo-source.png (or .jpg),\n` +
      `then run this again.\n`,
  );
  process.exit(1);
}

await mkdir(BRAND_DIR, { recursive: true });
const out = (name) => path.join(BRAND_DIR, name);

/*
 * Step 1 — key out the white background.
 *
 * The supplied file is a JPEG with an opaque white bed. The navbar sits
 * transparently over the hero video, so pasting that in would punch a white
 * rectangle over the building. Since the mark is dark ink on white, luminance
 * inverts directly into an alpha matte: white becomes fully transparent, the
 * strokes become fully opaque, and the antialiased edges land in between, which
 * keeps the curves smooth instead of stair-stepping.
 *
 * The RGB is then flooded with the logo's own ink colour, sampled below — so
 * every pixel is one flat colour varying only in alpha. That also means the
 * mark can be recoloured later by swapping INK.
 */
const { data, info } = await sharp(source)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = info.width * info.height;

// Sample the true ink colour from the darkest pixels rather than guessing.
let rs = 0;
let gs = 0;
let bs = 0;
let dark = 0;
for (let i = 0; i < px; i++) {
  const o = i * info.channels;
  const [r, g, b] = [data[o], data[o + 1], data[o + 2]];
  if (0.299 * r + 0.587 * g + 0.114 * b < 80) {
    rs += r;
    gs += g;
    bs += b;
    dark++;
  }
}
const INK =
  dark > 0
    ? {
        r: Math.round(rs / dark),
        g: Math.round(gs / dark),
        b: Math.round(bs / dark),
      }
    : { r: 0x19, g: 0x19, b: 0x19 };

console.log(
  `Source: ${path.basename(source)} ${info.width}x${info.height}\n` +
    `Ink sampled: rgb(${INK.r}, ${INK.g}, ${INK.b}) from ${dark.toLocaleString()} pixels`,
);

const rgba = Buffer.alloc(px * 4);
for (let i = 0; i < px; i++) {
  const o = i * info.channels;
  const lum = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  rgba[i * 4] = INK.r;
  rgba[i * 4 + 1] = INK.g;
  rgba[i * 4 + 2] = INK.b;
  rgba[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(255 - lum)));
}

// Step 2 — trim the generous empty margin back to the ink.
const lockup = await sharp(rgba, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 8 })
  .png()
  .toBuffer();

const lockupMeta = await sharp(lockup).metadata();
await sharp(lockup).toFile(out("pgsa-logo.png"));
console.log(`Lockup: pgsa-logo.png ${lockupMeta.width}x${lockupMeta.height}`);

/*
 * Step 3 — split the wordmark from the tagline.
 *
 * Rather than a hard-coded crop ratio, find the widest run of empty rows in the
 * lower half: that gap is the space between "PGSA" and "Architecture + Interior
 * Design". This survives the logo being re-exported at another size or leading.
 */
const { data: aData, info: aInfo } = await sharp(lockup)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const rowHasInk = new Array(aInfo.height).fill(false);
for (let y = 0; y < aInfo.height; y++) {
  for (let x = 0; x < aInfo.width; x++) {
    if (aData[(y * aInfo.width + x) * aInfo.channels + 3] > 24) {
      rowHasInk[y] = true;
      break;
    }
  }
}

let gapStart = -1;
let gapLen = 0;
let runStart = -1;
for (let y = Math.floor(aInfo.height * 0.45); y < aInfo.height; y++) {
  if (!rowHasInk[y]) {
    if (runStart === -1) runStart = y;
  } else if (runStart !== -1) {
    if (y - runStart > gapLen) {
      gapLen = y - runStart;
      gapStart = runStart;
    }
    runStart = -1;
  }
}

if (gapStart > 0 && gapLen > 2) {
  await sharp(lockup)
    .extract({ left: 0, top: 0, width: aInfo.width, height: gapStart })
    .trim({ threshold: 8 })
    .png()
    .toFile(out("pgsa-wordmark.png"));
  const wm = await sharp(out("pgsa-wordmark.png")).metadata();
  console.log(
    `Wordmark: pgsa-wordmark.png ${wm.width}x${wm.height} (cut at y=${gapStart}, ${gapLen}px gap)`,
  );
} else {
  await sharp(lockup).toFile(out("pgsa-wordmark.png"));
  console.log("Wordmark: no tagline gap found — using the full lockup");
}

/**
 * Step 4 — icons.
 *
 * A wide logotype squeezed into 16px is barely legible, so these letterbox the
 * wordmark on white. A square monogram would read better here if one exists.
 */
async function icon(size, name, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const mark = await sharp(out("pgsa-wordmark.png"))
    .resize({ width: inner, fit: "inside" })
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(out(name));
  console.log(`Icon: ${name} ${size}x${size}`);
}

await icon(16, "favicon-16.png", 0.04);
await icon(32, "favicon-32.png", 0.06);
await icon(180, "apple-touch-icon.png", 0.12);

/** Step 5 — link-preview card: full lockup centred on white. */
const ogMark = await sharp(lockup).resize({ width: 640, fit: "inside" }).toBuffer();
await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: ogMark, gravity: "center" }])
  .png()
  .toFile(out("og-image.png"));
console.log("OG card: og-image.png 1200x630");

console.log("\nDone.\n");
