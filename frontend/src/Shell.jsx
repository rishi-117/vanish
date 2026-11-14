import { ShieldCheck } from 'lucide-react'

export default function Shell({ children, onHome }) {
  return (
    <div className="page-wash flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-[600px] items-center justify-between px-6 pt-8 sm:pt-10">
        <button
          type="button"
          onClick={onHome}
          className="group flex items-center gap-2.5 rounded-lg text-chalk outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-4 focus-visible:ring-offset-void"
        >
          <span className="flex size-7 items-center justify-center rounded-[7px] border border-edge-bright bg-panel">
            <ShieldCheck
              className="size-4 text-violet-300 transition-colors group-hover:text-violet-200"
              strokeWidth={1.8}
            />
          </span>
          <span className="text-[15px] font-medium tracking-tight">Vanish</span>
        </button>

        <span className="font-mono text-[10px] tracking-[0.16em] text-mist/70 uppercase">
          one-time links
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center px-6 py-10 sm:py-14">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-[600px] px-6 pb-8">
        <div className="border-t border-edge/70 pt-5">
          <p className="text-[12px] leading-relaxed text-mist/80">
            Messages are held in the server's memory and deleted on first read. No
            accounts, no database, no tracking.
          </p>
        </div>
      </footer>
    </div>
  )
}
