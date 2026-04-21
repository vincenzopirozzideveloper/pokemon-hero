import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { POKEMON } from '../data/pokemon'
import OvalCard from './OvalCard'

const CARD_W = 110
const ACTIVE_W = 340
const GAP = 20
const TOTAL_W = ACTIVE_W + (POKEMON.length - 1) * CARD_W + (POKEMON.length - 1) * GAP

const REDUCED = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function leftFor(i: number, active: number, containerW: number): number {
  const rowLeft = Math.max(24, Math.round((containerW - TOTAL_W) / 2))
  if (i <= active) return rowLeft + i * (CARD_W + GAP)
  return rowLeft + i * (CARD_W + GAP) + (ACTIVE_W - CARD_W)
}

interface OvalCarouselProps {
  onActiveChange: (index: number) => void
}

export default function OvalCarousel({ onActiveChange }: OvalCarouselProps): ReactNode {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [containerW, setContainerW] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const morphBg = useCallback((index: number): void => {
    const next = POKEMON[index]?.bg ?? POKEMON[0]!.bg
    const accent = POKEMON[index]?.accent ?? '#ffffff'
    const layer = document.getElementById('bg-layer')
    if (layer) layer.style.backgroundColor = next
    if (REDUCED()) return
    const flash = document.getElementById('bg-flash')
    if (flash) {
      gsap.killTweensOf(flash)
      gsap.fromTo(
        flash,
        { opacity: 0, background: `radial-gradient(circle at 50% 55%, ${accent}44 0%, transparent 60%)` },
        {
          opacity: 1, duration: 0.6, ease: 'power2.out',
          onComplete: () => gsap.to(flash, { opacity: 0, duration: 1.6, ease: 'power2.inOut' }),
        }
      )
    }
  }, [])

  const select = useCallback((index: number): void => {
    if (index === activeIndex) return
    setActiveIndex(index)
    onActiveChange(index)
    morphBg(index)
  }, [activeIndex, onActiveChange, morphBg])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') select(Math.min(activeIndex + 1, POKEMON.length - 1))
      if (e.key === 'ArrowLeft') select(Math.max(activeIndex - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, select])

  useLayoutEffect(() => {
    if (!containerRef.current) return
    setContainerW(containerRef.current.getBoundingClientRect().width)
  }, [])

  useEffect(() => {
    const onResize = (): void => {
      if (!containerRef.current) return
      setContainerW(containerRef.current.getBoundingClientRect().width)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useGSAP(() => {
    if (REDUCED() || !containerRef.current) return
    const slots = containerRef.current.querySelectorAll<HTMLElement>('[data-card-slot]')
    gsap.from(slots, {
      opacity: 0,
      y: 32,
      duration: 1.0,
      ease: 'power3.out',
      stagger: 0.08,
      delay: 0.25,
    })
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Pokemon carousel"
      style={{
        position: 'relative',
        width: '100%',
        height: 440,
      }}
    >
      {POKEMON.map((pokemon, index) => {
        const left = leftFor(index, activeIndex, containerW)
        return (
          <div
            key={pokemon.id}
            data-card-slot={index}
            style={{
              position: 'absolute',
              top: '50%',
              left,
              transform: 'translateY(-50%)',
              transition: 'left 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <OvalCard
              pokemon={pokemon}
              isActive={index === activeIndex}
              onClick={() => select(index)}
              tabIndex={0}
            />
          </div>
        )
      })}
    </div>
  )
}
