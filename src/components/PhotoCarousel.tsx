"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Image from "next/image"

const PHOTO_COUNT = 5
const OFFSET = 4       // % shift per card in the stack
const SCALE_STEP = 0.05
const DIM_STEP = 0.15

interface PhotoCarouselProps {
  libraryId: number
}

export default function PhotoCarousel({ libraryId }: PhotoCarouselProps) {
  const [cards, setCards] = useState(() =>
    Array.from({ length: PHOTO_COUNT }, (_, i) => ({
      id: i,
      src: `/photos/${libraryId}_${i + 1}.jpg`,
    }))
  )

  const moveToEnd = (index: number) => {
    setCards(prev => {
      const next = [...prev]
      const [card] = next.splice(index, 1)
      next.push(card)
      return next
    })
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
            className="absolute left-0 w-full overflow-hidden rounded-lg"
            style={{ aspectRatio: "4/3" }}
            layout
            animate={{
              top: `${cardIndex * OFFSET}%`,
              scale: 1 - cardIndex * SCALE_STEP,
              filter: `brightness(${Math.max(0.1, 1 - cardIndex * DIM_STEP)})`,
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
            <Image
              src={card.src}
              alt={`Photo ${card.id + 1}`}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 768px) 100vw, 400px"
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
