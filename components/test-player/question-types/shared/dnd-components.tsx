'use client';

import { useDrag, useDrop } from 'react-dnd';

interface DraggableItemProps {
  text: string;
  index: number;
  itemType: string;
  prefix?: string;
}

interface DroppableZoneProps {
  index: number;
  matchedIndex?: number;
  matchedText?: string | null;
  prefix?: string;
  onDrop: (sourceIndex: number, targetIndex: number) => void;
  itemType: string;
  placeholder?: string;
}

export function DraggableItem({ text, index, itemType, prefix = '' }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`border px-2 py-1 rounded cursor-move text-xs ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {prefix && <span className="font-bold">{prefix}</span>}
      {text}
    </div>
  );
}

export function DroppableZone({
  index,
  matchedIndex,
  matchedText,
  prefix = '',
  onDrop,
  itemType,
  placeholder = 'Drop here'
}: DroppableZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: itemType,
    drop: (item: { index: number }) => onDrop(item.index, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`border rounded px-2 py-1 min-h-[1.75rem] ${
        isOver ? 'bg-gray-100' : matchedText ? 'bg-gray-200' : 'bg-white'
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
