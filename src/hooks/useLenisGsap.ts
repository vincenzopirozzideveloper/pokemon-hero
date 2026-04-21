import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'

export function useLenisGsap(): void {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.12,
    })

    const raf = (time: number): void => { lenis.raf(time * 1000) }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}
