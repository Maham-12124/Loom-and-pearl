import { createHash } from "crypto";
import { mkdir, writeFile, access } from "fs/promises";
import path from "path";
import { put, head } from "@vercel/blob";
import sharp from "sharp";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export type SaveUploadResult = { url: string } | { error: string };

/** Validates and saves an uploaded image, returning its public URL. Shared
 * by the admin and customer-facing upload routes.
 *
 * Filenames are content-hashed (not random) so uploading the exact same
 * image twice always produces the exact same URL — this both dedupes
 * identical files and lets callers detect a reused screenshot by simply
 * comparing URLs (see the admin order detail page).
 *
 * When BLOB_READ_WRITE_TOKEN is set (production, once a Vercel Blob store
 * is connected), files persist to Vercel Blob — Vercel's serverless
 * filesystem is ephemeral, so writing to public/uploads there is silently
 * lost. Local dev without that token keeps writing to public/uploads/.
 *
 * `trim: true` (used for charm photos) auto-crops uniform-color padding
 * around the subject before saving, so a small icon centered on a plain
 * background fills its circular frame instead of floating in dead space. */
export async function saveUploadedImage(
  file: File,
  options?: { trim?: boolean }
): Promise<SaveUploadResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return { error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File too large — max 5MB." };
  }

  let buffer: Buffer<ArrayBufferLike> = Buffer.from(await file.arrayBuffer());
  if (options?.trim) {
    buffer = await sharp(buffer)
      .trim()
      .toBuffer()
      .catch(() => buffer);
  }

  const hash = createHash("sha256").update(buffer).digest("hex");
  const filename = `${hash}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const pathname = `uploads/${filename}`;
    const existing = await head(pathname).catch(() => null);
    if (existing) return { url: existing.url };

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  if (process.env.VERCEL) {
    return {
      error:
        "Image storage isn't set up on this deployment yet. Connect a Blob store in the Vercel dashboard (Storage tab) and redeploy, then try again.",
    };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  const alreadyExists = await access(filePath).then(
    () => true,
    () => false
  );
  if (!alreadyExists) {
    await writeFile(filePath, buffer);
  }

  return { url: `/uploads/${filename}` };
}
