import { ArrowRight, Check, Copy, Link2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { createSecret } from './api'
import { useCopy } from './useCopy'

const MAX_LENGTH = 5000

export default function CreateSecret() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [shareLink, setShareLink] = useState('')
  const { copied, copy } = useCopy()

  const trimmed = message.trim()
  const tooLong = message.length > MAX_LENGTH
  const canSubmit = trimmed.length > 0 && !tooLong && status !== 'creating'

  async function handleCreate() {
    setStatus('creating')
    setError('')

    try {
      const id = await createSecret(message)
      setShareLink(`${window.location.origin}/s/${id}`)
      setStatus('created')
    } catch (problem) {
      setError(problem.message)
      setStatus('idle')
    }
  }

  function startOver() {
    setMessage('')
    setShareLink('')
    setError('')
    setStatus('idle')
  }

  if (status === 'created') {
    return (
      <div className="animate-rise">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] sm:text-[32px]">
          Your link is ready
        </h1>
        <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-mist">
          Send it however you like. It opens once, and the message is deleted the
          moment it does.
        </p>

        <div className="mt-7 rounded-2xl border border-edge bg-panel p-5">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-mist uppercase">
            <Link2 className="size-3.5" strokeWidth={2} />
            Secret link
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={shareLink}
              onFocus={(event) => event.target.select()}
              aria-label="Secret link"
              className="min-w-0 flex-1 rounded-lg border border-edge bg-void px-3 py-2.5 font-mono text-[12px] text-chalk outline-none select-all focus:border-edge-bright"
            />
            <button
              type="button"
              onClick={() => copy(shareLink)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-edge-bright bg-panel-raised px-4 py-2.5 text-[13px] font-medium text-chalk transition-colors hover:border-violet-400/40 hover:bg-[#1c1c22] focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:outline-none"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-violet-300" strokeWidth={2.2} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" strokeWidth={2} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-mist/80">
          Anyone with the link can read it once. Only the link is shared — the
          message never appears in the URL.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={startOver}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-violet-300 transition-colors hover:text-violet-200"
          >
            Create another secret
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.025em] sm:text-[38px]">
        Send a secret that
        <br className="hidden sm:block" /> disappears.
      </h1>
      <p className="mt-4 max-w-[48ch] text-[14px] leading-relaxed text-mist">
        One link, one read. The message lives in server memory until someone opens
        it, then it's gone for good.
      </p>

      <div className="mt-8 rounded-2xl border border-edge bg-panel p-2">
        <label htmlFor="secret" className="sr-only">
          Your secret message
        </label>
        <textarea
          id="secret"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            if (error) setError('')
          }}
          placeholder="Write something that should only be seen once..."
          spellCheck="false"
          className="block min-h-[176px] w-full resize-none bg-transparent px-4 py-4 text-[14.5px] leading-relaxed text-chalk placeholder:text-mist/45 focus:outline-none sm:min-h-[208px]"
        />

        <div className="flex items-center justify-between gap-4 border-t border-edge/80 px-4 py-3">
          <span
            className={`font-mono text-[11px] tracking-tight tabular-nums ${
              tooLong ? 'text-rose-400' : 'text-mist/70'
            }`}
          >
            {message.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-violet-400 focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-panel focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-edge-bright disabled:text-mist"
          >
            {status === 'creating' ? (
              <>
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />
                Creating
              </>
            ) : (
              'Create Secret Link'
            )}
          </button>
        </div>
      </div>

      {tooLong && (
        <p className="mt-3 text-[12.5px] text-rose-400">
          {message.length - MAX_LENGTH === 1
            ? 'One character over the limit. Trim it to create the link.'
            : `${(message.length - MAX_LENGTH).toLocaleString()} characters over the limit. Trim it to create the link.`}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-rose-500/25 bg-rose-500/[0.07] px-3.5 py-2.5 text-[12.5px] text-rose-200">
          {error}
        </p>
      )}

      <p className="mt-5 text-[12px] leading-relaxed text-mist/60">
        Not encrypted end to end in this version — the server can read the message
        while it waits. Don't send passwords you can't afford to lose.
      </p>
    </div>
  )
}
