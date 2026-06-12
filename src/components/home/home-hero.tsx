import Link from 'next/link'
import { Play, Mic2 } from 'lucide-react'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-8 text-white md:p-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-white/5 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-pink-500/10 blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
            East African Music
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Real music.<br />Streaming free.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            Discover artists from Uganda, Kenya, Tanzania and beyond.
            No account needed — hit play and start listening now.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-purple-700 shadow-lg transition hover:bg-white/90 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              Start listening
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              Join free
            </Link>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Play className="h-4 w-4 fill-white text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Free streaming</p>
                <p className="text-xs text-white/60">No credit card needed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Mic2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Local artists</p>
                <p className="text-xs text-white/60">Direct from the source</p>
              </div>
            </div>
            <Link
              href="/become-artist"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur transition hover:bg-white/20"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Mic2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Are you an artist?</p>
                <p className="text-xs text-white/60">Upload & earn today →</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
