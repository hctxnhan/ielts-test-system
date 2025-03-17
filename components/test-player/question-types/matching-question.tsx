'use client';
import { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { MatchingQuestion } from '@/lib/types';

interface MatchingQuestionProps {
  question: MatchingQuestion;
  value: Record<number, number> | null;
  onChange: (value: Record<number, number>) => void;
}

const ITEM_TYPE = 'OPTION';

export default function MatchingQuestionRenderer({
  question,
  value,
  onChange
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<number, number>>({});

  useEffect(() => {
    // Initialize matches from the value prop
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionIndex: number, itemIndex: number) => {
    setMatches((prevMatches) => {
      // Remove existing match if the option is already assigned
      const updatedMatches = Object.fromEntries(
        Object.entries(prevMatches).filter(
          ([, oIndex]) => oIndex !== optionIndex
        )
      );

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
            <p className="font-medium">Items</p>
            {question.items.map((item, itemIndex) => (
              <DroppableItem
                key={itemIndex}
                item={item}
                itemIndex={itemIndex}
                optionIndex={matches[itemIndex]}
                optionText={
                  matches[itemIndex] !== undefined
                    ? question.options[matches[itemIndex]]
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

          <div className="space-y-2">
            <p className="font-medium">Options</p>
            {question.options.map((option, optionIndex) => (
              <DraggableOption
                key={optionIndex}
                option={option}
                optionIndex={optionIndex}
                optionLetter={String.fromCharCode(65 + optionIndex)}
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
      className={`p-4 border rounded-md ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <Card className="p-3">
        <p>
          {itemIndex + 1}. {item}
        </p>
      </Card>
      <div className="mt-2">
        <Label>Your Answer:</Label>
        <div className="p-2 border rounded-md min-h-[2rem]">
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
