import { useEffect, useRef } from "react"

interface AudioWaveformProps {
  isRecording: boolean
  className?: string
}

export function AudioWaveform({ isRecording, className = "" }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      if (!isRecording) {
        // Draw static waveform
        ctx.strokeStyle = "hsl(175 60% 60%)"
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < width; i += 4) {
          const amplitude = Math.sin(i * 0.02) * 20
          ctx.lineTo(i, height / 2 + amplitude)
        }
        ctx.stroke()
        return
      }

      // Draw animated waveform
      const time = Date.now() * 0.01
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, "hsl(175 84% 32%)")
      gradient.addColorStop(0.5, "hsl(175 75% 45%)")
      gradient.addColorStop(1, "hsl(175 84% 32%)")
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.lineCap = "round"

      for (let x = 0; x < width; x += 2) {
        const frequency = 0.02 + Math.sin(time * 0.1) * 0.01
        const amplitude = (Math.sin(x * frequency + time) * 
                         Math.sin(x * frequency * 2 + time * 1.2) * 
                         Math.sin(x * frequency * 0.5 + time * 0.8)) * 30
        
        ctx.beginPath()
        ctx.moveTo(x, height / 2)
        ctx.lineTo(x, height / 2 + amplitude)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={100}
      className={`w-full h-20 ${className}`}
    />
  )
}