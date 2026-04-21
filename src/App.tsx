import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import TopNav from './components/TopNav'
import PromoBanner from './components/PromoBanner'
import OvalCarousel from './components/OvalCarousel'
import SideText from './components/SideText'
import { POKEMON } from './data/pokemon'

gsap.registerPlugin()

export default function App(): ReactNode {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const mainRef = useRef<HTMLDivElement>(null)

  // Entrance animation for side texts
  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !mainRef.current) return
    gsap.from(mainRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.05,
    })
  }, { scope: mainRef })

  const activePokemon = POKEMON[activeIndex] ?? POKEMON[0]!

  return (
    <div
      ref={mainRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Body-bg replacement layer (animated via CSS transition on state change) */}
      <div
        id="bg-layer"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundColor: POKEMON[0]!.bg,
          transition: 'background-color 1.8s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'background-color',
        }}
      />

      {/* Accent flash overlay (animated on active change) */}
      <div
        id="bg-flash"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0,
          mixBlendMode: 'screen',
        }}
      />

      {/* Radial gradient depth overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Subtle noise vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <TopNav />
      <PromoBanner />

      {/* Carousel centered vertically */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 64,
        }}
      >
        <OvalCarousel onActiveChange={setActiveIndex} />
      </div>

      <SideText pokemon={activePokemon} />
    </div>
  )
}
