'use client'

import { useState } from 'react'
import { Share2, Copy, CheckCircle, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ShareButtonsProps {
  title: string
  url?: string
  className?: string
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
        toast.success('Shared successfully')
      } catch {
        // user cancelled
      }
    } else {
      handleCopy()
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
      >
        {copied ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            Copied
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </>
        )}
      </button>
    </div>
  )
}

export default ShareButtons
