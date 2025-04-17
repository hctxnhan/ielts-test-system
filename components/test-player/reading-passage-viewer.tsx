"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { ReadingPassage } from "@/lib/types";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ExternalLink,
  Info,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
} from "lucide-react";
import { useState } from "react";

interface ReadingPassageViewerProps {
  passage: ReadingPassage;
  containerRef?: React.RefObject<HTMLDivElement | null>; // Updated type definition
}

export default function ReadingPassageViewer({
  passage,
  containerRef,
}: ReadingPassageViewerProps) {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "larger">(
    "normal"
  );
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    index: number;
  } | null>(null);

  // Text size controls
  const fontSizeClass =
    fontSize === "normal"
      ? "text-base"
      : fontSize === "large"
      ? "text-lg"
      : "text-xl";

  const increaseFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("larger");
  };

  const decreaseFontSize = () => {
    if (fontSize === "larger") setFontSize("large");
    else if (fontSize === "large") setFontSize("normal");
  };

  // Image zoom handling
  const openImageModal = (url: string, index: number) => {
    setSelectedImage({ url, index });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Split paragraphs for better readability
  const paragraphs = passage.content
    .split(/\n\n|\r\n\r\n/)
    .filter((p) => p.trim().length > 0);

  return (
    <div className="relative">
      {/* Image Zoom Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && closeImageModal()}
      >
        <DialogContent className="sm:max-w-[85vw] max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center">
            <DialogTitle>
              Figure {selectedImage ? selectedImage.index + 1 : ""}
            </DialogTitle>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-2">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={`Figure ${selectedImage.index + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header with controls - sticky at the top */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b pb-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium line-clamp-1">
              {passage.title}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={fontSize === "normal"}
                    onClick={decreaseFontSize}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Decrease text size</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={fontSize === "larger"}
                    onClick={increaseFontSize}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Increase text size</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Reading guide */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Words: ~{passage.content.split(/\s+/).length}</span>
          <span>·</span>
          <span>Paragraphs: {paragraphs.length}</span>
          <span>·</span>
          <span>
            Est. reading time:{" "}
            {Math.ceil(passage.content.split(/\s+/).length / 200)} min
          </span>
        </div>
      </div>

      {/* Images section with improved styling and click to zoom */}
      {passage.hasImages &&
        passage.imageUrls &&
        passage.imageUrls.length > 0 && (
          <div className="space-y-4 mb-6 border p-3 rounded-md bg-muted/10">
            <h4 className="text-sm font-medium text-primary flex items-center gap-1.5 mb-2">
              <Info className="h-4 w-4" />
              Visual Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {passage.imageUrls.map((url, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="border rounded-md overflow-hidden bg-white p-1 cursor-pointer hover:shadow-md transition-shadow relative group"
                    onClick={() => openImageModal(url, index)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                      <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Figure ${index + 1}`}
                      className="max-w-full h-auto object-contain max-h-[300px]"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Badge variant="outline" className="font-normal h-5">
                      Figure {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Images may contain important information required to answer
              questions. Click on any image to view it in full size.
            </p>
          </div>
        )}

      {/* Content with paragraph styling */}
      <div className={`prose dark:prose-invert max-w-none ${fontSizeClass}`}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer with source information */}
      {passage.source && (
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="italic">Source: {passage.source}</span>
          </p>
        </div>
      )}
    </div>
  );
}
