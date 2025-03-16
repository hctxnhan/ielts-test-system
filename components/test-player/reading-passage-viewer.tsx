"use client"

import { useState } from "react"
import type { ReadingPassage } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"

interface ReadingPassageViewerProps {
  passage: ReadingPassage
}

export default function ReadingPassageViewer({ passage }: ReadingPassageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [activeTab, setActiveTab] = useState<string>("passage")

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2)
    }
  }

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2)
    }
  }

  return (
    <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{passage.title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={decreaseFontSize}>
            <ChevronLeft className="h-4 w-4" />A
          </Button>
          <Button variant="outline" size="sm" onClick={increaseFontSize}>
            A
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="passage">Reading Passage</TabsTrigger>
          {passage.hasImages && <TabsTrigger value="images">Images</TabsTrigger>}
        </TabsList>

        <TabsContent value="passage">
          <Card className={`overflow-auto ${isFullscreen ? "h-[calc(100vh-120px)]" : "max-h-[60vh]"}`}>
            <CardContent className="p-4">
              <div style={{ fontSize: `${fontSize}px` }} className="whitespace-pre-line">
                {passage.content}
              </div>
              {passage.source && <p className="text-sm text-muted-foreground mt-4 italic">Source: {passage.source}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {passage.hasImages && (
          <TabsContent value="images">
            <Card className={`overflow-auto ${isFullscreen ? "h-[calc(100vh-120px)]" : "max-h-[60vh]"}`}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {passage.imageUrls?.map((url, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <img src={url || "/placeholder.svg"} alt={`Figure ${index + 1}`} className="max-w-full h-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Figure {index + 1}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

