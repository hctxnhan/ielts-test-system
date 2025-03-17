"use client"

import { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { PickFromListQuestion } from "@/lib/types"

interface PickFromListQuestionProps {
  question: PickFromListQuestion
  value: Record<number, number> | null
  onChange: (value: Record<number, number>) => void
}

const ITEM_TYPE = 'OPTION';

export default function PickFromListQuestionRenderer({
  question,
  value,
  onChange
}: PickFromListQuestionProps) {
  // Ensure options and items are always arrays
  const options = question.options || [];
  const items = question.items || [];

  const [matches, setMatches] = useState<Record<number, number>>({});

  useEffect(() => {
    // Initialize matches from the value prop
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionIndex: number, itemIndex: number) => {
    setMatches((prevMatches) => {
      // Remove existing match if the option is already assigned to another item
      const updatedMatches = { ...prevMatches };

      // Assign the option to the item
      updatedMatches[itemIndex] = optionIndex;

      // Notify the parent component of the change
      onChange(updatedMatches);

      return updatedMatches;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <p className="font-medium">{question.text}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="font-medium">Possible Options:</p>
            {options.map((option, optionIndex) => (
              <DraggableOption
                key={optionIndex}
                option={option}
                optionIndex={optionIndex}
                optionLetter={String.fromCharCode(65 + optionIndex)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-medium">Items:</p>
            {items.map((item, itemIndex) => (
              <DroppableItem
                key={itemIndex}
                item={item}
                itemIndex={itemIndex}
                optionIndex={matches[itemIndex]}
                optionText={
                  matches[itemIndex] !== undefined
                    ? options[matches[itemIndex]]
                    : null
                }
                optionLetter={
                  matches[itemIndex] !== undefined
                    ? String.fromCharCode(65 + matches[itemIndex])
                    : null
                }
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

function DraggableOption({ option, optionIndex, optionLetter }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { optionIndex },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <Card
      ref={drag}
      className={`p-3 cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <p>
        <span className="font-bold">{optionLetter}.</span> {option}
      </p>
    </Card>
  );
}

function DroppableItem({
  item,
  itemIndex,
  optionIndex,
  optionText,
  optionLetter,
  onDrop
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item) => onDrop(item.optionIndex, itemIndex),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`p-2 border rounded-md ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="flex items-center space-x-2">
        <span className="w-1/3">{item}</span>
        <div className="flex-1 p-2 border rounded-md min-h-[2rem]">
          {optionText ? (
            <span className="font-bold">
              {optionLetter}. {optionText}
            </span>
          ) : (
            <span className="text-gray-400">Drag an option here</span>
          )}
        </div>
      </div>
    </div>
  );
}

