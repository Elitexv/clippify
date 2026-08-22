import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "public/android-chrome-512x512.png";
const RES = "android/app/src/main/res";

const YELLOW = { r: 0xfd, g: 0xf3, b: 0x05 };

async function transparentGlyph() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < 30 && g < 30 && b < 30) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

const glyphBuf = await transparentGlyph();

// --- Legacy + round launcher icons (flat black square + yellow glyph) ---
const launcherSizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [density, size] of Object.entries(launcherSizes)) {
  const dir = `${RES}/mipmap-${density}`;
  mkdirSync(dir, { recursive: true });
  const buf = await sharp(SRC).resize(size, size, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  await sharp(buf).toFile(`${dir}/ic_launcher.png`);
  await sharp(buf).toFile(`${dir}/ic_launcher_round.png`);
}

// --- Adaptive icon foreground (transparent glyph, inset in safe zone) ---
const foregroundSizes = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
for (const [density, size] of Object.entries(foregroundSizes)) {
  const dir = `${RES}/mipmap-${density}`;
  mkdirSync(dir, { recursive: true });
  const glyphSize = Math.round(size * 0.6);
  const offset = Math.round((size - glyphSize) / 2);
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: await sharp(glyphBuf).resize(glyphSize, glyphSize, { kernel: sharp.kernel.lanczos3 }).toBuffer(), left: offset, top: offset },
    ])
    .png()
    .toFile(`${dir}/ic_launcher_foreground.png`);
}

// --- Splash screens: white bg, centered logo chip, sized exactly per density/orientation ---
const splashTargets = [
  ["drawable", 480, 320],
  ["drawable-port-mdpi", 320, 480],
  ["drawable-port-hdpi", 480, 800],
  ["drawable-port-xhdpi", 720, 1280],
  ["drawable-port-xxhdpi", 960, 1600],
  ["drawable-port-xxxhdpi", 1280, 1920],
  ["drawable-land-mdpi", 480, 320],
  ["drawable-land-hdpi", 800, 480],
  ["drawable-land-xhdpi", 1280, 720],
  ["drawable-land-xxhdpi", 1600, 960],
  ["drawable-land-xxxhdpi", 1920, 1280],
];
for (const [dir, w, h] of splashTargets) {
  const outDir = `${RES}/${dir}`;
  mkdirSync(outDir, { recursive: true });
  const chip = Math.round(Math.min(w, h) * 0.28);
  const left = Math.round((w - chip) / 2);
  const top = Math.round((h - chip) / 2);
  await sharp({ create: { width: w, height: h, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: await sharp(SRC).resize(chip, chip, { kernel: sharp.kernel.lanczos3 }).toBuffer(), left, top }])
    .png()
    .toFile(`${outDir}/splash.png`);
}

console.log("Android icon + splash assets generated.");
