"use client"

import { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { PickFromListQuestion } from "@/lib/types"
import { DraggableItem, DroppableZone } from './shared/dnd-components';

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
  const options = question.options || [];
  const items = question.items || [];

  const [matches, setMatches] = useState<Record<number, number>>({});

  useEffect(() => {
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionIndex: number, itemIndex: number) => {
    setMatches((prevMatches) => {
      const updatedMatches = { ...prevMatches };
      updatedMatches[itemIndex] = optionIndex;
      onChange(updatedMatches);
      return updatedMatches;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <p className="font-medium">{question.text}</p>

        <div className="space-y-2 w-fit">
          <p className="font-medium">Possible Options:</p>
          {options.map((option, optionIndex) => (
            <DraggableItem
              key={optionIndex}
              text={option}
              index={optionIndex}
              itemType={ITEM_TYPE}
              prefix={String.fromCharCode(65 + optionIndex) + '.'}
            />
          ))}
        </div>

        <div className="space-y-2">
          <p className="font-medium">Items:</p>
          {items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-2">
              <Label className='w-[200px]'>{item}</Label>
              <DroppableZone
                key={itemIndex}
                index={itemIndex}
                matchedIndex={matches[itemIndex]}
                matchedText={matches[itemIndex] !== undefined ? options[matches[itemIndex]] : null}
                prefix={matches[itemIndex] !== undefined ? String.fromCharCode(65 + matches[itemIndex]) + '.' : ''}
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

