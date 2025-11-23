import { useEffect, useRef } from "react"

export function useMousePositionRef(containerRef: React.RefObject<HTMLDivElement>) {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      positionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const container = containerRef.current
    container?.addEventListener("mousemove", handleMouseMove)

    return () => {
      container?.removeEventListener("mousemove", handleMouseMove)
    }
  }, [containerRef])

  return positionRef
}
