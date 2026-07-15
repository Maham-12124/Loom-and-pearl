import { NextRequest, NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/upload";

/** Customer-facing upload for JazzCash/EasyPaisa payment proof screenshots
 * at checkout — intentionally not admin-gated (checkout doesn't require
 * login), but validated the same way as the admin upload route. */
export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const result = await saveUploadedImage(file);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}
