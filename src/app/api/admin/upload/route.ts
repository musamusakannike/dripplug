import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { adminUploadSchema } from "@/lib/validators";
import { uploadUrl, deleteObject } from "@/lib/storage";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
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
