"use client";

import * as React from "react";
import { cn } from "@testComponents/lib/utils";
import { Textarea } from "./textarea";

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, minRows = 3, maxRows = 15, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [textareaHeight, setTextareaHeight] = React.useState<
    number | undefined
  >(undefined);

  // Merge the forwarded ref with our internal ref
  React.useImperativeHandle(
    ref,
    () => textareaRef.current as HTMLTextAreaElement,
  );

  const calculateHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate row height based on a single line
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;

    // Calculate min and max heights
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;

    // Check if content exceeds max height
    const contentExceedsMax = textarea.scrollHeight > maxHeight;

    // Set height based on content, bounded by min and max
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );

    // Apply the new height
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);

    // Set overflow property based on content height
    textarea.style.overflowY = contentExceedsMax ? "auto" : "hidden";
  }, [minRows, maxRows]);

  // Recalculate height when content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    calculateHeight();
  };

  // Calculate initial height on mount and when props change
  React.useEffect(() => {
    calculateHeight();
  }, [calculateHeight, props.value]);

  return (
    <Textarea
      ref={textareaRef}
      className={cn("transition-height duration-100", className)}
      onChange={handleChange}
      style={{
        height: textareaHeight ? `${textareaHeight}px` : undefined,
      }}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
