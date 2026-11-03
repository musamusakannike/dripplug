import crypto from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "dripplug-media";
const R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL || "https://cdn.dripplug.com.ng"
).replace(/\/$/, "");

let s3ClientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Missing Cloudflare R2 environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)."
    );
  }
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
}

export function getPublicUrl(key: string): string {
  const cleanKey = key.replace(/^\//, "");
  return `${R2_PUBLIC_URL}/${cleanKey}`;
}

export function extractObjectKeyFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) {
    return null;
  }
  return url.slice(R2_PUBLIC_URL.length).replace(/^\//, "");
}

/**
 * Generates a short-lived presigned PUT URL so the admin browser uploads
 * directly to Cloudflare R2 without passing file bytes through Next.js.
 */
export async function uploadUrl(params: {
  fileName: string;
  fileType: "image/jpeg" | "image/png" | "image/webp";
  fileSize: number;
  folder?: "products" | "categories";
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const client = getR2Client();
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = extMap[params.fileType] || "jpg";
  const folder = params.folder || "products";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: params.fileType,
    ContentLength: params.fileSize,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  return {
    uploadUrl: signedUrl,
    publicUrl: getPublicUrl(key),
    key,
  };
}

/**
 * Deletes an object from R2 by either object key or full R2 public URL.
 */
export async function deleteObject(keyOrUrl: string): Promise<void> {
  try {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return;
    }
    const key = keyOrUrl.startsWith("http")
      ? extractObjectKeyFromUrl(keyOrUrl)
      : keyOrUrl;

    if (!key) return;

    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (err) {
    console.error("[R2 deleteObject warning]:", err);
  }
}
