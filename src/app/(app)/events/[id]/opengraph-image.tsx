import { ImageResponse } from 'next/og'
import { serverFetch } from '@/lib/api'

export const runtime = 'edge'
export const alt = 'Event on TesoTunes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { id: string }
}

export default async function Image({ params }: Props) {
  let title = 'TesoTunes Event'
  let description = 'Get tickets on TesoTunes'
  let coverUrl: string | null = null

  try {
    const res = await serverFetch<{
      data: { title: string; description?: string; cover_image?: string; banner_url?: string }
    }>(`/events/${params.id}`)
    title = res.data.title
    description = res.data.description || description
    coverUrl = res.data.cover_image || res.data.banner_url || null
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
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '48px 60px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ color: '#e94560', fontSize: 20, marginBottom: 12, fontWeight: 600 }}>
            Event · TesoTunes
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: title.length > 40 ? 44 : 60,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {title}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 22 }}>
            {description.length > 100 ? description.slice(0, 97) + '…' : description}
          </div>
        </div>
      </div>
    ),
    size
  )
}
