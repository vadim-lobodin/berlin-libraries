"use client"

import { useState } from "react"
import { motion } from "motion/react"
import PHOTO_INDEX from "../data/photo-index"

const OFFSET = 4       // % shift per card in the stack
const SCALE_STEP = 0.05
const OPACITIES = [1, 0.55, 0.40, 0.10, 0.05]
const STAGGER = 0.06   // seconds between each card appearing

interface PhotoCarouselProps {
  libraryId: number
}

export default function PhotoCarousel({ libraryId }: PhotoCarouselProps) {
  const photoNums = PHOTO_INDEX[libraryId] || []
  const photos = photoNums.map(n => `/libraries/photos/${libraryId}_${n}.jpg`)

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

  return (
    <div
      className="relative w-full"
      style={{ paddingBottom: `${75 + (cards.length - 1) * OFFSET}%` }}
    >
      {cards.map((card, i) => {
        const isFront = i === 0
        const cardIndex = i
        // Cards appear from back to front: last card first, front card last
        const appearDelay = i * STAGGER
        return (
          <motion.div
            key={card.id}
            className="absolute left-0 w-full overflow-hidden rounded-[14px]"
            style={{ aspectRatio: "4/3" }}
            layout
            initial={{ opacity: 0, y: 15, scale: 1 - cardIndex * SCALE_STEP }}
            animate={{
              top: `${cardIndex * OFFSET}%`,
              scale: 1 - cardIndex * SCALE_STEP,
              opacity: OPACITIES[cardIndex] ?? 0.05,
              y: 0,
              zIndex: cards.length - i,
            }}
            transition={{
              type: "spring", stiffness: 300, damping: 30,
              opacity: { delay: appearDelay, duration: 0.5, ease: "easeOut" },
              y: { delay: appearDelay, duration: 0.5, ease: "easeOut" },
            }}
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
