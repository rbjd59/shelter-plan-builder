import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
})

function UnsubscribePage() {
  const search = useSearch({ from: '/unsubscribe' })
  const token = (search as any).token as string | undefined
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'already' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('No token provided.')
      return
    }

    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyUnsubscribed) {
          setStatus('already')
          setMessage('You are already unsubscribed.')
        } else if (data.valid) {
          setStatus('valid')
          setMessage('Click below to confirm your unsubscribe.')
        } else {
          setStatus('invalid')
          setMessage('Invalid or expired token.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      })
  }, [token])

  const handleConfirm = async () => {
    try {
      const res = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage('You have been unsubscribed.')
      } else {
        setStatus('error')
        setMessage('Failed to unsubscribe. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Unsubscribe
        </h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        {status === 'valid' && (
          <button
            onClick={handleConfirm}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Confirm Unsubscribe
          </button>
        )}
        {(status === 'success' || status === 'already') && (
          <div className="text-sm text-muted-foreground">
            You will no longer receive emails from DetencionDefensa.
          </div>
        )}
        {(status === 'invalid' || status === 'error') && (
          <div className="text-sm text-muted-foreground">
            If you need help, contact{" "}
            <a href="mailto:info@detenciondefensa.com" className="text-primary underline">
              info@detenciondefensa.com
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
