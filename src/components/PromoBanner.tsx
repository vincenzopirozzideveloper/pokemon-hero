import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

export default function PromoBanner(): ReactNode {
  const bannerRef = useRef<HTMLAnchorElement>(null)

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !bannerRef.current) return

    gsap.from(bannerRef.current, {
      opacity: 0,
      y: -12,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.9,
    })

    gsap.to(bannerRef.current, {
      y: '+=3',
      duration: 1.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2,
    })
  }, { scope: bannerRef })

  const handleEnter = (): void => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    gsap.killTweensOf(bannerRef.current)
    gsap.to(bannerRef.current, {
      scale: 1.05,
      duration: 0.4,
      ease: 'power3.out',
    })
    const arrow = bannerRef.current?.querySelector('[data-arrow]')
    if (arrow) gsap.to(arrow, { x: 4, duration: 0.4, ease: 'power3.out' })
  }

  const handleLeave = (): void => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    gsap.killTweensOf(bannerRef.current)
    gsap.to(bannerRef.current, {
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
      onComplete: () => {
        gsap.to(bannerRef.current, {
          y: '+=3',
          duration: 1.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      },
    })
    const arrow = bannerRef.current?.querySelector('[data-arrow]')
    if (arrow) gsap.to(arrow, { x: 0, duration: 0.5, ease: 'power3.out' })
  }

  return (
    <a
      ref={bannerRef}
      href="https://linktr.ee/vincenzopirozzidev"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'absolute',
        top: 92,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 15,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 26px',
        background: 'linear-gradient(135deg, #FDE047 0%, #FACC15 60%, #EAB308 100%)',
        color: '#111',
        borderRadius: 9999,
        fontFamily: 'Inter Tight, sans-serif',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        boxShadow:
          '0 10px 28px -6px rgba(250, 204, 21, 0.55), 0 2px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)',
        border: '1px solid rgba(234, 179, 8, 0.6)',
        cursor: 'pointer',
        willChange: 'transform',
      }}
      aria-label="Hire me — sites like this on Linktree"
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: 9999,
          background: '#111',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span>Want a site like this?</span>
      <span style={{ opacity: 0.55 }}>·</span>
      <span style={{ fontWeight: 800 }}>Hire Vincenzo</span>
      <span
        data-arrow
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginLeft: 2,
          willChange: 'transform',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 11L11 3M11 3H5M11 3V9" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  )
}
