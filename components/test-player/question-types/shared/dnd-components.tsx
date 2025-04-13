"use client";

import { useDrag, useDrop } from "react-dnd";
import type { RefCallback } from "react";

interface DraggableItemProps {
  text: string;
  index: string | number;
  itemType: string;
  prefix?: string;
}

interface DroppableZoneProps {
  subQuestionId: string;
  matchedId?: string;
  matchedText?: string | null;
  prefix?: string;
  onDrop: (sourceId: string, targetId: string) => void;
  itemType: string;
  placeholder?: string;
}

export function DraggableItem({
  text,
  index,
  itemType,
  prefix = "",
}: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: itemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef as unknown as RefCallback<HTMLDivElement>}
      className={`border px-2 py-1 rounded cursor-move text-xs ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {prefix && <span className="font-bold">{prefix}</span>}
      {text}
    </div>
  );
}

export function DroppableZone({
  subQuestionId,
  matchedId,
  matchedText,
  prefix = "",
  onDrop,
  itemType,
  placeholder = "Drop here",
}: DroppableZoneProps) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: itemType,
    drop: (item: { index: string }) => onDrop(item.index, subQuestionId),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef as unknown as RefCallback<HTMLDivElement>}
      className={`border rounded px-2 py-1 min-h-[1.75rem] ${
        isOver ? "bg-gray-100" : matchedText ? "bg-gray-200" : "bg-white"
      }`}
    >
      {matchedText ? (
        <span className="text-xs">
          {prefix && <span className="font-bold">{prefix}</span>}
          {matchedText}
        </span>
      ) : (
        <span className="text-gray-400 text-xs">{placeholder}</span>
      )}
    </div>
  );
}
