import Link from 'next/link'
import { LayoutDashboard, Library, Radio, Upload, TrendingUp, Users, ShieldCheck, Mic2 } from 'lucide-react'

type HomeUser = {
  name?: string | null
  role?: string
  isArtist?: boolean
}

function getGreeting(): string {
  const hour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Africa/Kampala' })
  ).getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(name: string | null | undefined): string {
  if (!name) return 'there'
  return name.split(' ')[0]
}

type QuickAction = {
  icon: React.ReactNode
  label: string
  description: string
  href: string
}

function getQuickActions(role: string | undefined, isArtist: boolean | undefined): QuickAction[] {
  const icon = (C: React.ElementType) => <C className="h-4 w-4 text-white" />

  if (role === 'admin' || role === 'super_admin') {
    return [
      { icon: icon(LayoutDashboard), label: 'Admin panel', description: 'Manage the platform', href: '/admin' },
      { icon: icon(ShieldCheck), label: 'Moderation', description: 'Review pending content', href: '/admin/moderation' },
      { icon: icon(TrendingUp), label: 'Analytics', description: 'Platform stats', href: '/admin/analytics' },
    ]
  }

  if (role === 'moderator') {
    return [
      { icon: icon(ShieldCheck), label: 'Moderation queue', description: 'Review pending content', href: '/admin/moderation' },
      { icon: icon(Library), label: 'My library', description: 'Your saved music', href: '/library' },
      { icon: icon(Radio), label: 'Discover', description: 'Find new music', href: '/browse' },
    ]
  }

  if (role === 'label') {
    return [
      { icon: icon(LayoutDashboard), label: 'Label dashboard', description: 'Manage your roster', href: '/label/dashboard' },
      { icon: icon(Users), label: 'Your artists', description: 'View all artists', href: '/label/artists' },
      { icon: icon(TrendingUp), label: 'Analytics', description: 'Label performance', href: '/label/analytics' },
    ]
  }

  if (isArtist || role === 'artist') {
    return [
      { icon: icon(LayoutDashboard), label: 'Dashboard', description: 'Your artist hub', href: '/artist/dashboard' },
      { icon: icon(Upload), label: 'Upload track', description: 'Share new music', href: '/artist/songs/upload' },
      { icon: icon(TrendingUp), label: 'Earnings', description: 'Track your revenue', href: '/artist/earnings' },
    ]
  }

  return [
    { icon: icon(Library), label: 'My library', description: 'Your saved music', href: '/library' },
    { icon: icon(Radio), label: 'Discover', description: 'Find new sounds', href: '/browse' },
    { icon: icon(Mic2), label: 'Become an artist', description: 'Upload & earn today →', href: '/become-artist' },
  ]
}

function getRoleSubtitle(role: string | undefined, isArtist: boolean | undefined): string {
  if (role === 'admin' || role === 'super_admin') return 'You have full platform access.'
  if (role === 'moderator') return 'Keep the community great.'
  if (role === 'label') return 'Manage your label and roster.'
  if (isArtist || role === 'artist') return 'Your audience is waiting.'
  return 'Ready to keep listening?'
}

export function UserWelcomeBanner({ user }: { user: HomeUser }) {
  const greeting = getGreeting()
  const firstName = getFirstName(user.name)
  const actions = getQuickActions(user.role, user.isArtist)
  const subtitle = getRoleSubtitle(user.role, user.isArtist)

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-8 text-white md:p-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-pink-500/10 blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
            East African Music
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            {greeting},<br />
            <span className="text-white/90">{firstName}.</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            {subtitle}
          </p>
        </div>

        <div className="hidden shrink-0 lg:block">
          <div className="flex flex-col gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur transition hover:bg-white/20 active:scale-95"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-white/60">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
