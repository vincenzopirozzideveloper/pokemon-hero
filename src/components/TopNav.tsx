import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

const NAV_LINKS = ['NEW RELEASES', '3D ILLUS', 'DIGITAL', 'ART', 'CUSTOMIZE'] as const

export default function TopNav(): ReactNode {
  const navRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !navRef.current) {
      gsap.set(navRef.current, { y: 0, opacity: 1 })
      return
    }
    gsap.from(navRef.current, {
      y: -16,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay: 0.1,
    })
  }, { scope: navRef })

  return (
    <nav
      ref={navRef}
      aria-label="Pokemon Hero navigation"
      className="fixed top-0 inset-x-0 z-50 px-8 py-4 flex items-center justify-between pointer-events-none"
    >
      {/* Left nav links */}
      <ul className="flex items-center gap-6 pointer-events-auto" role="list">
        {NAV_LINKS.map((label) => (
          <li key={label}>
            <a
              href="#"
              className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors duration-200"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right cluster */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Profile ring */}
        <button
          type="button"
          aria-label="Profile"
          className="w-8 h-8 rounded-full border border-white/40 hover:border-white/80 transition-colors duration-200 flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="5" r="2.5" stroke="white" strokeWidth="1.2" opacity="0.7" />
            <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </button>

        {/* Wordmark */}
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-white font-semibold">
          pokeart
        </span>
      </div>
    </nav>
  )
}
