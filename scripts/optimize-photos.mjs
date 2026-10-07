// Prepares room photos for the site.
//
//   1. Put the original photos in:  photos-raw/<room>/   (rooms: bahar, tabestan, paeez, zemestan, suite)
//      The first photo (by file name) is the room's cover on the room cards; the rest follow in order.
//   2. Run:  node scripts/optimize-photos.mjs
//   3. Result: public/images/rooms/<room>/1.jpg, 2.jpg, ...  (and the `images: [...]` line to paste into lib/rooms/index.js)
//
// What it does: fixes phone rotation (EXIF), converts to sRGB, strips metadata (GPS etc.), limits the long edge to 2000px
// (never enlarges) and saves a progressive JPEG at quality 82, which is visually lossless for room photos.
// Photos that are already web-sized JPEGs (long edge <= 2000px, under 500 KB, e.g. exported from Telegram) are copied untouched:
// re-compressing them would only lose quality.
// The site itself then serves each visitor a right-sized WebP/AVIF through next/image, so these files are only the "master" copies.
// Keep photos-raw/ out of git (add it to .gitignore) if the originals are large.
import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOMS = ['bahar', 'tabestan', 'paeez', 'zemestan', 'suite'];
const SRC = 'photos-raw';
const OUT = 'public/images/rooms';
const MAX_EDGE = 2000;
const QUALITY = 82;
const EXT = /\.(jpe?g|png|webp|tif|tiff|avif)$/i;

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let total = 0;

for (const room of ROOMS) {
  const dir = path.join(SRC, room);
  let files;
  try {
    files = (await readdir(dir)).filter((f) => EXT.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  } catch {
    console.log(`- ${room}: no folder ${dir}, skipped`);
    continue;
  }
  if (!files.length) { console.log(`- ${room}: folder is empty, skipped`); continue; }

  const outDir = path.join(OUT, room);
  await mkdir(outDir, { recursive: true });
  // Remove old numbered photos so a smaller set never leaves stale files behind.
  for (const old of await readdir(outDir)) if (/^\d+\.jpg$/.test(old)) await rm(path.join(outDir, old));

  const names = [];
  for (const [i, file] of files.entries()) {
    const name = `${i + 1}.jpg`;
    const target = path.join(outDir, name);
    const source = path.join(dir, file);
    const meta = await sharp(source).metadata();
    const small = /\.jpe?g$/i.test(file) && Math.max(meta.width, meta.height) <= MAX_EDGE && (await stat(source)).size < 500 * 1024 && (meta.orientation ?? 1) === 1;
    if (small) {
      await copyFile(source, target);
      total += (await stat(target)).size;
      names.push(name);
      console.log(`  ${room}/${name}  <- ${file}  ${meta.width}x${meta.height}  copied as is`);
      continue;
    }
    const info = await sharp(source)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(target);
    total += (await stat(target)).size;
    names.push(name);
    console.log(`  ${room}/${name}  <- ${file}  ${info.width}x${info.height}  ${kb(info.size)}`);
  }
  console.log(`- ${room}: ${names.length} photos\n  images: [${names.map((n) => `'${n}'`).join(', ')}],`);
}
console.log(`\nTotal: ${kb(total)}`);
