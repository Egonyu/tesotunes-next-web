import { ImageResponse } from 'next/og'
import { serverFetch } from '@/lib/api'

export const runtime = 'edge'
export const alt = 'Artist on TesoTunes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { slug: string }
}

export default async function Image({ params }: Props) {
  let name = 'TesoTunes Artist'
  let bio = 'Stream African music on TesoTunes'
  let avatarUrl: string | null = null

  try {
    const res = await serverFetch<{ data: { name: string; bio?: string; avatar_url?: string } }>(
      `/artists/${params.slug}`
    )
    name = res.data.name
    bio = res.data.bio || bio
    avatarUrl = res.data.avatar_url || null
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
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            width={200}
            height={200}
            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ color: '#e94560', fontSize: 20, marginBottom: 12, fontWeight: 600 }}>
            Artist · TesoTunes
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: name.length > 20 ? 52 : 72,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {name}
          </div>
          <div style={{ color: '#9ca3af', fontSize: 24, lineHeight: 1.4 }}>
            {bio.length > 120 ? bio.slice(0, 117) + '…' : bio}
          </div>
        </div>
      </div>
    ),
    size
  )
}
