import { NextResponse } from "next/server";
import { getUploadedImageById } from "@/lib/mysql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const image = await getUploadedImageById(id);

  if (!image) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = Uint8Array.from(image.fileData).buffer;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(image.sizeBytes),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
