"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"

const PHOTO_COUNT = 5
const OFFSET = 4       // % shift per card in the stack
const SCALE_STEP = 0.05
const OPACITIES = [1, 0.55, 0.40, 0.10, 0.05]

interface PhotoCarouselProps {
  libraryId: number
}

function usePreloadImages(srcs: string[]) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const promises = srcs.map(
      src => new Promise<void>((resolve) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // don't block on missing images
        img.src = src
      })
    )
    Promise.all(promises).then(() => {
      if (!cancelled) setLoaded(true)
    })
    return () => { cancelled = true }
  }, [srcs])

  return loaded
}

export default function PhotoCarousel({ libraryId }: PhotoCarouselProps) {
  const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => `/libraries/photos/${libraryId}_${i + 1}.jpg`)
  const loaded = usePreloadImages(photos)

  const [cards, setCards] = useState(() =>
    photos.map((src, i) => ({ id: i, src }))
  )

  const moveToEnd = (index: number) => {
    setCards(prev => {
      const next = [...prev]
      const [card] = next.splice(index, 1)
      next.push(card)
      return next
    })
  }

  if (!loaded) {
    return (
      <div
        className="relative w-full rounded-[20px] bg-muted/30 animate-pulse"
        style={{ paddingBottom: `${75 + (PHOTO_COUNT - 1) * OFFSET}%` }}
      />
    )
  }

  return (
    <div
      className="relative w-full"
      style={{ paddingBottom: `${75 + (PHOTO_COUNT - 1) * OFFSET}%` }}
    >
      {cards.map((card, i) => {
        const isFront = i === 0
        const cardIndex = i
        return (
          <motion.div
            key={card.id}
            className="absolute left-0 w-full overflow-hidden rounded-[20px]"
            style={{ aspectRatio: "4/3" }}
            layout
            initial={false}
            animate={{
              top: `${cardIndex * OFFSET}%`,
              scale: 1 - cardIndex * SCALE_STEP,
              opacity: OPACITIES[cardIndex] ?? 0.05,
              zIndex: cards.length - i,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={isFront ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragMomentum={false}
            whileDrag={{ scale: 1.05, rotate: 2, zIndex: cards.length + 1 }}
            onDragEnd={() => { if (isFront) moveToEnd(0) }}
            onTap={() => { if (isFront) moveToEnd(0) }}
            whileTap={isFront ? { cursor: "grabbing" } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.src}
              alt={`Photo ${card.id + 1}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            {isFront && (
              <div className="absolute inset-0 cursor-grab active:cursor-grabbing" />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
