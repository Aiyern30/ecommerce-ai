import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "#3B82F6",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "20%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Shopping bag */}
          <svg
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 27h54l-4.5 31.5c-.45 3.15-2.7 4.5-5.4 4.5H27.9c-2.7 0-4.95-1.35-5.4-4.5L18 27z"
              fill="white"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M31.5 27V22.5c0-7.65 6.3-13.5 13.5-13.5s13.5 5.85 13.5 13.5V27"
              stroke="white"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginTop: "8px",
            }}
          >
            YTL
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
