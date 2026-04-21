import { ImageResponse } from 'next/og'
import { serverFetch } from '@/lib/api'

export const runtime = 'edge'
export const alt = 'Album on TesoTunes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { slug: string }
}

export default async function Image({ params }: Props) {
  let title = 'TesoTunes Album'
  let artistName = ''
  let artworkUrl: string | null = null

  try {
    const res = await serverFetch<{
      data: { title: string; artwork_url?: string; artist?: { name: string } }
    }>(`/albums/${params.slug}`)
    title = res.data.title
    artistName = res.data.artist?.name || ''
    artworkUrl = res.data.artwork_url || null
  } catch {
    // use defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          alignItems: 'center',
          padding: '60px',
          gap: '48px',
          fontFamily: 'sans-serif',
        }}
      >
        {artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artworkUrl}
            alt=""
            width={220}
            height={220}
            style={{ borderRadius: '12px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />
        ) : (
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: '12px',
              background: '#e94560',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
            }}
          >
            🎵
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ color: '#e94560', fontSize: 20, marginBottom: 12, fontWeight: 600 }}>
            Album · TesoTunes
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: title.length > 25 ? 48 : 64,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {title}
          </div>
          {artistName && (
            <div style={{ color: '#9ca3af', fontSize: 28 }}>by {artistName}</div>
          )}
        </div>
      </div>
    ),
    size
  )
}
