import { ImageResponse } from "next/og";
import {
  APP_DOMAIN,
  APP_NAME,
  APP_TAGLINE,
  CAMPUS_NAME,
  CURRENCY,
  DELIVERY_POINTS,
} from "@/config/site";

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "48px",
              fontWeight: 900,
              letterSpacing: "-2px",
              textTransform: "uppercase",
            }}
          >
            {APP_NAME}
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              padding: "12px 28px",
              borderRadius: "9999px",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {APP_DOMAIN}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              textTransform: "uppercase",
              maxWidth: "960px",
            }}
          >
            {APP_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              color: "#555555",
              maxWidth: "850px",
            }}
          >
            {`Jerseys • Heavyweight Round Necks • Baggy Jeans • Hoodies • Caps for ${CAMPUS_NAME}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {DELIVERY_POINTS.map((pt) => {
            const feeText =
              pt.fee === 0 ? "FREE" : `${CURRENCY} ${pt.fee}`;
            return (
              <div
                key={pt.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E5E5E5",
                  borderRadius: "20px",
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ display: "flex", fontSize: "20px", fontWeight: 800 }}>
                  {`${pt.name} Drop-Off`}
                </span>
                <span style={{ display: "flex", fontSize: "16px", color: "#666666" }}>
                  {`${feeText} • ${pt.estimatedTime}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
