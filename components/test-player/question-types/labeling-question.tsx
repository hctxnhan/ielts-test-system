"use client"

import type { LabelingQuestion } from '@/lib/types';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableItem, DroppableZone } from './shared/dnd-components';
import { Label } from 'recharts';

interface LabelingQuestionProps {
  question: LabelingQuestion;
  value: Record<number, number> | null;
  onChange: (value: Record<number, number>) => void;
}

const ITEM_TYPE = 'OPTION';

export default function LabelingQuestionRenderer({
  question,
  value,
  onChange
}: LabelingQuestionProps) {
  const [matches, setMatches] = useState<Record<number, number>>({});

  useEffect(() => {
    // Initialize matches from the value prop
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionIndex: number, labelIndex: number) => {
    setMatches((prevMatches) => {
      // Remove existing match if the option is already assigned
      const updatedMatches = Object.fromEntries(
        Object.entries(prevMatches).filter(
          ([, oIndex]) => oIndex !== optionIndex
        )
      );

      // Assign the option to the label
      updatedMatches[labelIndex] = optionIndex;

      // Notify the parent component of the change
      onChange(updatedMatches);

      return updatedMatches;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        <p className="font-medium text-sm">{question.text}</p>
        <div className="relative border rounded-lg overflow-hidden" style={{ height: '200px' }}>
          <img
            src={question.imageUrl || '/placeholder.svg'}
            alt="Diagram to label"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <p className="font-medium text-sm">Labels</p>
            {question.labels.map((label, labelIndex) => (
              <div key={labelIndex} className="flex items-center gap-2">
                <span className="text-sm min-w-[200px]">{label}</span>
                <DroppableZone
                  index={labelIndex}
                  itemType={ITEM_TYPE}
                  matchedText={matches[labelIndex] !== undefined ? question.options[matches[labelIndex]] : null}
                  onDrop={handleDrop}
                  placeholder="Drag option here"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Options</p>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((option, optionIndex) => (
                <DraggableItem
                  key={optionIndex}
                  text={option}
                  index={optionIndex}
                  itemType={ITEM_TYPE}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

