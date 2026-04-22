import { NextResponse } from "next/server";
import { ensureAuthSessionsTable, saveUploadedImage } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await ensureAuthSessionsTable();
    const currentUser = await getCurrentSessionUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Vui long dang nhap de upload anh." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Khong tim thay tep anh." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Chi chap nhan tep hinh anh." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "Kich thuoc anh phai lon hon 0 va nho hon 5MB." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageId = await saveUploadedImage({
      mimeType: file.type,
      originalName: file.name,
      sizeBytes: file.size,
      fileData: buffer,
      createdByEmail: currentUser.email,
    });

    return NextResponse.json({
      url: `/api/uploads/image/${imageId}`,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { message: "Khong the upload anh luc nay. Vui long thu lai." },
      { status: 500 },
    );
  }
}
