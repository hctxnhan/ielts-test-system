"use client";

import React from "react";
import { cn } from "@testComponents/lib/utils";
import type { RefCallback } from "react";
import { useDrag, useDrop } from "react-dnd";

interface DraggableItemProps {
  text: string;
  index: string | number;
  itemType: string;
  prefix?: string;
  disabled?: boolean;
  className?: string;
}

interface DroppableZoneProps {
  subQuestionId: string;
  matchedId?: string;
  matchedText?: string | null;
  prefix?: string;
  onDrop: (sourceId: string, targetId: string) => void;
  itemType: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface DragItem {
  index: string;
  text: string;
  prefix?: string;
}

export function DraggableItem({
  text,
  index,
  itemType,
  prefix = "",
  disabled = false,
  className = "",
}: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >(() => ({
    type: itemType,
    item: { index: String(index), text, prefix },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef as unknown as RefCallback<HTMLDivElement>}
      className={cn(
        "border px-3 py-2 rounded text-sm transition-all duration-200 shadow-sm",
        {
          "opacity-50 scale-95 border-dashed": isDragging,
          "opacity-100": !isDragging,
          "cursor-default opacity-50": disabled,
          "cursor-grab hover:border-blue-400 hover:shadow-md active:cursor-grabbing hover:bg-blue-50":
            !disabled && !isDragging,
        },
        className,
      )}
      title={disabled ? undefined : "Drag this item"}
    >
      {prefix && <span className="font-bold mr-1">{prefix}</span>}
      {text}
    </div>
  );
}

export function DroppableZone({
  subQuestionId,
  matchedText,
  prefix = "",
  onDrop,
  itemType,
  placeholder = "Drop here",
  disabled = false,
  className = "",
}: DroppableZoneProps) {
  const [{ isOver, canDrop }, dropRef] = useDrop<
    DragItem,
    unknown,
    { isOver: boolean; canDrop: boolean }
  >(() => ({
    accept: itemType,
    canDrop: () => !disabled,
    drop: (item) => {
      onDrop(item.index, subQuestionId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={dropRef as unknown as RefCallback<HTMLDivElement>}
      className={cn(
        "border-2 rounded px-3 py-2 min-h-[2.5rem] min-w-[150px] transition-all duration-200 shadow-sm",
        {
          "bg-blue-100 border-blue-500 shadow-md": isOver,
          "bg-gray-200": matchedText && !isOver,
          "bg-white": !matchedText && !isOver,
          "hover:border-blue-400 hover:bg-blue-50": !disabled && !matchedText,
          "cursor-not-allowed opacity-60": disabled,
        },
        className,
      )}
      title={disabled ? "This drop zone is disabled" : "Drop item here"}
    >
      {matchedText ? (
        <span className="text-sm font-medium">
          {prefix && <span className="font-bold mr-1">{prefix}</span>}
          {matchedText}
        </span>
      ) : (
        <span className="text-gray-500 text-sm flex items-center justify-center h-full">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {placeholder}
        </span>
      )}
    </div>
  );
}
