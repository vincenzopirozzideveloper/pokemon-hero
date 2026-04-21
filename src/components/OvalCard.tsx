import { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'
import type { Pokemon } from '../data/pokemon'

interface OvalCardProps {
  pokemon: Pokemon
  isActive: boolean
  onClick: () => void
  tabIndex?: number
}

// Fixed dimensions for the inner image wrapper. The image is rendered ONCE at this size;
// the card's overflow:hidden acts as a mask. No object-fit recalculation during card width animation.
const IMG_W = 340
const IMG_H = 420

export default function OvalCard({ pokemon, isActive, onClick, tabIndex = 0 }: OvalCardProps): ReactNode {
  const cardRef = useRef<HTMLButtonElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  // Random phase offset per card so they don't all pulse in sync
  const pulseOffsetRef = useRef<number>(Math.random() * 1.2)

  const startPulse = (): void => {
    const el = cardRef.current
    if (!el) return
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { scale: 1, y: 0 },
      {
        scale: 1.06,
        duration: 1.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: pulseOffsetRef.current,
      }
    )
  }

  useEffect(() => {
    const el = cardRef.current
    const imgWrap = imgWrapRef.current
    if (!el || !imgWrap) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    gsap.killTweensOf(el)
    gsap.killTweensOf(imgWrap)
    gsap.set(imgWrap, { force3D: true })

    if (isActive) {
      // Active: card is still (no pulse), image zooms and pans as it expands
      gsap.to(el, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      const tl = gsap.timeline()
      tl.fromTo(imgWrap,
        { scale: 1, y: 0 },
        { scale: 1.22, y: -10, duration: 1.1, ease: 'power3.out' }
      )
      tl.to(imgWrap, { scale: 1.28, y: -16, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    } else {
      // Inactive: image back to neutral + start the pulse loop on the card
      gsap.to(imgWrap, { scale: 1, y: 0, duration: 1.1, ease: 'power3.out' })
      startPulse()
    }
  }, [isActive])

  const handleMouseEnter = (): void => {
    if (isActive) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    // Pause the pulse, lift the card on hover
    gsap.killTweensOf(cardRef.current)
    gsap.to(cardRef.current, { scale: 1.07, y: -10, duration: 0.5, ease: 'power3.out' })
  }

  const handleMouseLeave = (): void => {
    if (isActive) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    // Settle back and resume pulse
    gsap.killTweensOf(cardRef.current)
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      onComplete: () => startPulse(),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <button
      ref={cardRef}
      type="button"
      role="button"
      tabIndex={tabIndex}
      aria-label={`Select ${pokemon.name} — ${pokemon.label}`}
      aria-pressed={isActive}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      style={{
        width: isActive ? 340 : 110,
        height: isActive ? 420 : 360,
        borderRadius: isActive ? '36px' : '55px',
        transition: 'width 1.1s cubic-bezier(0.22, 1, 0.36, 1), height 1.1s cubic-bezier(0.22, 1, 0.36, 1), border-radius 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        cursor: isActive ? 'default' : 'pointer',
        border: 'none',
        outline: 'none',
        background: '#000',
        padding: 0,
        boxShadow: isActive
          ? `0 24px 60px -12px ${pokemon.accent}70, 0 8px 24px -6px rgba(0,0,0,0.55)`
          : `0 0 36px 2px ${pokemon.accent}40, 0 12px 28px -8px rgba(0,0,0,0.45)`,
        transform: 'translateZ(0)',
        isolation: 'isolate',
      }}
    >
      {/* Fixed-size image wrapper — never reflows during card size animation */}
      <div
        ref={imgWrapRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: IMG_W,
          height: IMG_H,
          marginLeft: -IMG_W / 2,
          marginTop: -IMG_H / 2,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <img
          src={pokemon.image}
          alt={pokemon.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
        {/* Dark vignette overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isActive
              ? 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)'
              : 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Info badge — active only */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter Tight, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            {pokemon.name}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {pokemon.blurb}
          </span>
        </div>
      )}
    </button>
  )
}
