import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#3B82F6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Shopping bag SVG path */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h12l-1 7c-.1.6-.6 1-1.2 1H6.2c-.6 0-1.1-.4-1.2-1L4 6z"
              fill="white"
              stroke="white"
              strokeWidth="0.5"
            />
            <path
              d="M7 6V5c0-1.7 1.3-3 3-3s3 1.3 3 3v1"
              stroke="white"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              fontSize: '8px',
              fontWeight: 'bold',
              marginTop: '2px',
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
  )
}
