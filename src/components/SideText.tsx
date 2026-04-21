import { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'
import type { Pokemon } from '../data/pokemon'

interface SideTextProps {
  pokemon: Pokemon
}

export default function SideText({ pokemon }: SideTextProps): ReactNode {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const prevIdRef = useRef<string>('')

  useEffect(() => {
    if (prevIdRef.current === pokemon.id) return
    prevIdRef.current = pokemon.id

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const targets = [leftRef.current, rightRef.current].filter(Boolean)
    gsap.fromTo(
      targets,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.08 }
    )
  }, [pokemon.id])

  return (
    <>
      {/* Bottom-left: title + metadata */}
      <div
        ref={leftRef}
        style={{
          position: 'fixed',
          bottom: 52,
          left: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontFamily: 'Inter Tight, sans-serif',
            fontWeight: 800,
            fontSize: 42,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          {pokemon.label.split(' ').map((word, i) => (
            <span key={i} style={{ display: 'block' }}>{word}</span>
          ))}
        </h1>

        <div
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            PUBLISHED
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            NOV 05, 2026
          </span>
          <a
            href="#"
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)' }}
          >
            MORE DIGITAL ART ↗
          </a>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 700,
            }}
          >
            BEHANCE · MORE
          </span>
        </div>
      </div>

      {/* Bottom-right: body text */}
      <div
        ref={rightRef}
        style={{
          position: 'fixed',
          bottom: 52,
          right: 56,
          maxWidth: 320,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: 'Inter Tight, sans-serif',
            fontSize: 13,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.01em',
          }}
        >
          {pokemon.body}
        </p>
      </div>
    </>
  )
}
