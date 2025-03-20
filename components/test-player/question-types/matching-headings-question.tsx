'use client';

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableItem, DroppableZone } from './shared/dnd-components';
import { Label } from '@/components/ui/label';

// Define the type for the question
type MatchingHeadingsQuestion = {
  headings: string[];
  paragraphs: string[];
};

// Define the props for the component
type MatchingHeadingsQuestionRendererProps = {
  question: MatchingHeadingsQuestion;
  value: Record<number, number> | null;
  onChange: (value: Record<number, number>) => void;
};

const ITEM_TYPE = 'HEADING';

export default function MatchingHeadingsQuestionRenderer({
  question,
  value,
  onChange
}: MatchingHeadingsQuestionRendererProps) {
  const [matches, setMatches] = useState<Record<number, number>>({}); // Stores paragraph -> heading mapping

  useEffect(() => {
    // Initialize matches from the value prop
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (headingIndex: number, paraIndex: number) => {
    setMatches((prevMatches) => {
      // Remove existing match if the heading is already assigned
      const updatedMatches = Object.fromEntries(
        Object.entries(prevMatches).filter(
          ([, hIndex]) => hIndex !== headingIndex
        )
      );

      // Assign the heading to the paragraph
      updatedMatches[paraIndex] = headingIndex;

      // Notify the parent component of the change
      onChange(updatedMatches);

      return updatedMatches;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="space-y-2 w-fit">
          <Label className="text-sm">Headings:</Label>
          <div className="flex flex-col space-y-2">
            {question.headings.map((heading, headingIndex) => (
              <DraggableItem
                key={headingIndex}
                text={heading}
                index={headingIndex}
                itemType={ITEM_TYPE}
                prefix={`${String.fromCharCode(65 + headingIndex)}. `}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm">Paragraphs:</Label>
          {question.paragraphs.map((paragraph, paraIndex) => (
            <div key={paraIndex} className="space-y-2 w-fit min-w-[300px]">
              <p className="text-xs text-gray-600 whitespace-pre-line">{
                question.scoringStrategy === 'partial' 
                  ? `Paragraph ${question.index + paraIndex}.` 
                  : `${paraIndex + 1}.`} {paragraph}</p>
              <DroppableZone
                index={paraIndex}
                itemType={ITEM_TYPE}
                matchedIndex={matches[paraIndex]}
                matchedText={
                  matches[paraIndex] !== undefined
                    ? question.headings[matches[paraIndex]]
                    : null
                }
                onDrop={handleDrop}
                prefix={
                  matches[paraIndex] !== undefined
                    ? `${String.fromCharCode(65 + matches[paraIndex])}. `
                    : ''
                }
                placeholder="Drag heading here"
              />
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
