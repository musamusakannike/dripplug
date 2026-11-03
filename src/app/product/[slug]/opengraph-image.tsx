import { ImageResponse } from "next/og";
import { APP_NAME, CAMPUS_SHORT_NAME, CURRENCY } from "@/config/site";
import { getProductBySlug } from "@/lib/catalog";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);

  const title = product?.name || APP_NAME;
  const priceText = product
    ? `${CURRENCY} ${product.basePrice.toLocaleString("en-NG")}`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F0EEED",
          padding: "64px",
          color: "#000000",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "flex",
              fontSize: "44px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-1.5px",
            }}
          >
            {APP_NAME}
          </span>
          <span
            style={{
              display: "flex",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              padding: "10px 24px",
              borderRadius: "9999px",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {`${CAMPUS_SHORT_NAME} Campus Delivery`}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "64px",
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 1.06,
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          {priceText ? (
            <div
              style={{
                display: "flex",
                fontSize: "48px",
                fontWeight: 800,
              }}
            >
              {priceText}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", fontSize: "22px", color: "#555555" }}>
          {`Free Old Park Drop-Off (${CURRENCY} 0) • Hostel Delivery (${CURRENCY} 500) • New Park (${CURRENCY} 750)`}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
