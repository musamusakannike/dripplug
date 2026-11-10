import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { adminUploadSchema } from "@/lib/validators";
import { uploadUrl, uploadBuffer, deleteObject } from "@/lib/storage";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const folderRaw = formData.get("folder");
      const folder =
        folderRaw === "categories" ? "categories" : ("products" as const);

      if (!(file instanceof File)) {
        return apiError("No image file provided.", 400);
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        return apiError("Only JPEG, PNG, and WEBP images are allowed.", 400);
      }
      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        return apiError("Maximum file size is 5MB.", 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadBuffer({
        buffer,
        fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
        folder,
      });

      return apiSuccess(uploaded);
    }

    const body = await req.json();
    const parsed = adminUploadSchema.parse(body);

    const signed = await uploadUrl({
      fileName: parsed.fileName,
      fileType: parsed.fileType,
      fileSize: parsed.fileSize,
      folder: parsed.folder,
    });

    return apiSuccess(signed);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    const { url } = await req.json();
    if (typeof url === "string" && url.trim()) {
      await deleteObject(url.trim());
    }

    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
