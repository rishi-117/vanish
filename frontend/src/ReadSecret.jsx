import { ArrowRight, Check, Copy, Eye, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { readSecret } from './api'
import { useCopy } from './useCopy'

export default function ReadSecret({ id, onCreate }) {
  const [state, setState] = useState('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { copied, copy } = useCopy()

  async function handleReveal() {
    setState('loading')
    setError('')

    try {
      const { ok, status, data } = await readSecret(id)

      if (ok && typeof data?.message === 'string') {
        setMessage(data.message)
        setState('revealed')
        return
      }

      if (status === 404) {
        setState('gone')
        return
      }

      setError(data?.error ?? 'Something went wrong while revealing the secret.')
      setState('idle')
    } catch (problem) {
      setError(problem.message)
      setState('idle')
    }
  }

  if (state === 'revealed') {
    return (
      <div className="animate-rise">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-violet-300/90 uppercase">
          <span className="size-1.5 rounded-full bg-violet-400" />
          Read once
        </div>

        <h1 className="mt-4 text-[26px] leading-tight font-semibold tracking-[-0.02em] sm:text-[30px]">
          Here's your secret
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">
          This was the only look. Reloading this page won't bring it back.
        </p>

        <div className="mt-6 rounded-2xl border border-edge bg-panel">
          <pre className="max-h-[420px] overflow-auto px-5 py-5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap text-chalk selection:bg-violet-400/30">
            {message}
          </pre>
          <div className="flex items-center justify-between gap-3 border-t border-edge/80 px-4 py-3">
            <span className="text-[11.5px] text-mist/70">
              Now stored only in this tab
            </span>
            <button
              type="button"
              onClick={() => copy(message)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-mist transition-colors hover:text-chalk focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:outline-none"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-violet-300" strokeWidth={2.2} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" strokeWidth={2} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="mt-8 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-violet-300 transition-colors hover:text-violet-200"
        >
          Create your own secret
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    )
  }

  if (state === 'gone') {
    return (
      <div className="animate-rise">
        <div className="flex size-10 items-center justify-center rounded-lg border border-edge bg-panel">
          <ShieldAlert className="size-[18px] text-mist" strokeWidth={1.8} />
        </div>

        <h1 className="mt-5 text-[26px] leading-tight font-semibold tracking-[-0.02em] sm:text-[30px]">
          This secret has vanished.
        </h1>
        <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-mist">
          It was opened already, it never existed, or the link is incomplete. There
          is nothing left to show — that's how Vanish is supposed to work.
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-violet-300 transition-colors hover:text-violet-200"
        >
          Create your own secret
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    )
  }

  return (
    <div className="animate-rise">
      <div className="flex size-10 items-center justify-center rounded-lg border border-edge bg-panel">
        <Lock className="size-[18px] text-violet-300" strokeWidth={1.8} />
      </div>

      <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.02em] sm:text-[34px]">
        Someone left you a secret
      </h1>
      <p className="mt-3.5 max-w-[48ch] text-[14px] leading-relaxed text-mist">
        It's still sealed on the server. Open it when you're ready to read it,
        because you only get one chance.
      </p>

      <div className="mt-7 rounded-xl border border-edge bg-panel px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-edge-bright bg-void">
            <Lock className="size-3 text-mist" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-chalk">Sealed message</p>
            <p className="truncate font-mono text-[11px] text-mist/60">{id}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleReveal}
          disabled={state === 'loading'}
          className="group inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4.5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-violet-400 focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-void focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-edge-bright disabled:text-mist"
        >
          {state === 'loading' ? (
            <>
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />
              Opening
            </>
          ) : (
            <>
              <Eye className="size-3.5" strokeWidth={2} />
              Reveal Message
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-500/25 bg-rose-500/[0.07] px-3.5 py-2.5 text-[12.5px] text-rose-200">
          {error}
        </p>
      )}

      <p className="mt-5 text-[12px] leading-relaxed text-mist/60">
        Revealing deletes the message from the server in the same request.
      </p>
    </div>
  )
}
