import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const score = searchParams.get('score') || '90';
    const domain = searchParams.get('domain') || 'yourwebsite.com';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050a15',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 112, 243, 0.2) 0%, transparent 50%)',
            fontFamily: 'sans-serif',
            color: '#f0f4f8',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 20, color: '#00d4ff' }}>
            ✦ Growth Auditor AI
          </div>
          <div style={{ fontSize: 80, fontWeight: 900, marginBottom: 20 }}>
            {domain}
          </div>
          <div style={{ fontSize: 32, color: '#94a3b8', marginBottom: 40 }}>
            Cosmic Alignment Score
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: '#fff',
              background: 'linear-gradient(135deg, #00d4ff 0%, #7000ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {score}/100
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.log(e instanceof Error ? e.message : "Unknown error");
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
