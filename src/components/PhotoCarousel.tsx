"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, animate } from "motion/react"
import Image from "next/image"

const PHOTO_COUNT = 5
const GAP = 8

interface PhotoCarouselProps {
  libraryId: number
}

export default function PhotoCarousel({ libraryId }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => `/photos/${libraryId}_${i + 1}.jpg`)

  const getSlideWidth = () => {
    if (!containerRef.current) return 0
    return containerRef.current.offsetWidth
  }

  const snapTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, PHOTO_COUNT - 1))
    setActiveIndex(clamped)
    animate(x, -(clamped * (getSlideWidth() + GAP)), {
      type: "spring",
      visualDuration: 0.3,
      bounce: 0.15,
    })
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const slideWidth = getSlideWidth()
    if (!slideWidth) return

    const swipeThreshold = slideWidth / 4
    const offset = info.offset.x
    const velocity = info.velocity.x

    let newIndex = activeIndex
    if (offset < -swipeThreshold || velocity < -500) {
      newIndex = activeIndex + 1
    } else if (offset > swipeThreshold || velocity > 500) {
      newIndex = activeIndex - 1
    }

    snapTo(newIndex)
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="overflow-hidden rounded-lg">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ x, gap: GAP }}
          drag="x"
          dragConstraints={{ left: -((PHOTO_COUNT - 1) * (getSlideWidth() + GAP)), right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          {photos.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] flex-shrink-0"
              style={{ width: "100%" }}
            >
              <Image
                src={src}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover rounded-lg pointer-events-none"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-center gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => snapTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === activeIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
