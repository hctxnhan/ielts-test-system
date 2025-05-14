"use client";

import { cn } from "@testComponents/lib/utils";
import type { RefCallback } from "react";
import { useDrag, useDrop } from "react-dnd";

interface DraggableItemProps {
  text: string;
  index: string | number;
  itemType: string;
  prefix?: string;
  disabled?: boolean;
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
}

export function DraggableItem({
  text,
  index,
  itemType,
  prefix = "",
  disabled = false,
}: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >(() => ({
    type: itemType,
    item: { index: String(index) },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef as unknown as RefCallback<HTMLDivElement>}
      className={`border px-2 py-1 rounded text-xs ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${disabled ? "cursor-default opacity-50" : "cursor-move"}`}
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
  const [{ isOver }, dropRef] = useDrop<DragItem, unknown, { isOver: boolean }>(
    () => ({
      accept: itemType,
      canDrop: () => !disabled,
      drop: (item) => onDrop(item.index, subQuestionId),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
  );

  return (
    <div
      ref={dropRef as unknown as RefCallback<HTMLDivElement>}
      className={cn(
        "border rounded px-2 py-1 min-h-[1.75rem] min-w-[200px]",
        {
          "bg-gray-100": isOver,
          "bg-gray-200": matchedText && !isOver,
          "bg-white": !matchedText && !isOver,
        },
        className,
      )}
    >
      {matchedText ? (
        <span className="text-xs">
          {prefix && <span className="font-bold mr-1">{prefix}</span>}
          {matchedText}
        </span>
      ) : (
        <span className="text-gray-400 text-xs">{placeholder}</span>
      )}
    </div>
  );
}

