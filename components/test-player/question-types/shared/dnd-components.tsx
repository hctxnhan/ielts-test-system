"use client";

import React, { useCallback } from "react";
import { cn } from "@testComponents/lib/utils";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

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

export function DraggableItem({
  text,
  index,
  itemType,
  prefix = "",
  disabled = false,
  className = "",
}: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${index}`,
    data: { index: String(index), text, prefix, itemType },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "border px-2 py-2 rounded text-xs transition-all duration-200 shadow-sm select-none",
        {
          "opacity-50 scale-95 border-dashed": isDragging,
          "opacity-100": !isDragging,
          "cursor-default opacity-50": disabled,
          "cursor-grab hover:border-blue-400 hover:shadow-md active:cursor-grabbing hover:bg-blue-50":
            !disabled && !isDragging,
          "touch-none": !disabled,
        },
        className,
      )}
      title={disabled ? undefined : "Drag this item"}
    >
      {prefix && <span className="font-semibold mr-1 text-xs">{prefix}</span>}
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
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${subQuestionId}`,
    data: { subQuestionId, itemType },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 rounded px-2 py-1 min-h-[2rem] min-w-[120px] transition-all duration-200 shadow-sm",
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
        <span className="text-xs font-medium">
          {prefix && <span className="font-semibold mr-1 text-xs">{prefix}</span>}
          {matchedText}
        </span>
      ) : (
        <span className="text-gray-500 text-xs flex items-center justify-center h-full">
          {placeholder}
        </span>
      )}
    </div>
  );
}

// DndProvider replacement - wraps matching/labeling questions with @dnd-kit context
interface DndMatchingProviderProps {
  children: React.ReactNode;
  onDrop: (sourceId: string, targetId: string) => void;
}

export function DndMatchingProvider({ children, onDrop }: DndMatchingProviderProps) {
  const [activeItem, setActiveItem] = React.useState<{ text: string; prefix: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { text, prefix } = event.active.data.current || {};
    setActiveItem({ text: text || "", prefix: prefix || "" });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const sourceId = active.data.current?.index;
    const targetSubQuestionId = over.data.current?.subQuestionId;

    if (sourceId && targetSubQuestionId) {
      onDrop(sourceId, targetSubQuestionId);
    }
  }, [onDrop]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeItem ? (
          <div className="border px-2 py-2 rounded text-xs shadow-lg bg-white border-blue-400 opacity-90">
            {activeItem.prefix && <span className="font-semibold mr-1 text-xs">{activeItem.prefix}</span>}
            {activeItem.text}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
