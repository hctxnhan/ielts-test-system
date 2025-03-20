"use client"

import type { ReadingPassage } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

interface ReadingPassageViewerProps {
  passage: ReadingPassage
}

export default function ReadingPassageViewer({ passage }: ReadingPassageViewerProps) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{passage.title}</h3>
      </div>

      {passage.hasImages && passage.imageUrls && passage.imageUrls.length > 0 && (
        <div className="space-y-4 mb-6">
          {passage.imageUrls.map((url, index) => (
            <div key={index} className="flex flex-col items-center">
              <img src={url || "/placeholder.svg"} alt={`Figure ${index + 1}`} className="max-w-full h-auto" />
              <p className="text-sm text-muted-foreground mt-2">Figure {index + 1}</p>
            </div>
          ))}
        </div>
      )}

      <div className="whitespace-pre-line">
        {passage.content}
      </div>

      {passage.source && (
        <p className="text-sm text-muted-foreground mt-4 italic">Source: {passage.source}</p>
      )}
    </div>
  )
}

