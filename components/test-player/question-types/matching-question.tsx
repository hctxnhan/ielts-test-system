'use client';
import type { MatchingQuestion } from '@/lib/types';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableItem, DroppableZone } from './shared/dnd-components';
import { Label } from '@/components/ui/label';

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
        <div className="space-y-2 w-fit">
          <p className="font-medium">Options</p>
          {question.options.map((option, optionIndex) => (
            <DraggableItem
              key={optionIndex}
              text={option}
              index={optionIndex}
              itemType={ITEM_TYPE}
              prefix={String.fromCharCode(65 + optionIndex) + '. '}
            />
          ))}
        </div>
        <div className="space-y-2">
          <p className="font-medium">Items</p>
          {question.items.map((item, itemIndex) => (
            <div className='flex items-center gap-2' key={itemIndex}>
              <Label className='w-[200px]'>{itemIndex + 1}. {item}</Label>
              <DroppableZone
                key={itemIndex}
                index={itemIndex}
                matchedIndex={matches[itemIndex]}
                matchedText={matches[itemIndex] !== undefined ? question.options[matches[itemIndex]] : null}
                prefix={matches[itemIndex] !== undefined ? String.fromCharCode(65 + matches[itemIndex]) + '. ' : ''}
                onDrop={handleDrop}
                itemType={ITEM_TYPE}
                placeholder="Drag an option here"
              />
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
