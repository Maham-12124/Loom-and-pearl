import { createHash } from "crypto";
import { mkdir, writeFile, access } from "fs/promises";
import path from "path";
import { put, head } from "@vercel/blob";

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
 * lost. Local dev without that token keeps writing to public/uploads/. */
export async function saveUploadedImage(file: File): Promise<SaveUploadResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return { error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File too large — max 5MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
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
