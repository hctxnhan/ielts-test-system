'use client';

import { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '@/components/ui/card';
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
      <div className="relative">
        {/* Sticky Heading Section */}
        <div className="sticky top-0 bg-white z-10">
          <p className="font-medium mb-2">Headings:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {question.headings.map((heading, headingIndex) => (
              <DraggableHeading
                key={headingIndex}
                heading={heading}
                headingIndex={headingIndex}
              />
            ))}
          </div>
        </div>

        {/* Paragraphs Section */}
        <div className="space-y-4 mt-10">
          <p className="font-medium">Paragraphs:</p>
          {question.paragraphs.map((paragraph, paraIndex) => (
            <DroppableParagraph
              key={paraIndex}
              paragraph={paragraph}
              paraIndex={paraIndex}
              headingIndex={matches[paraIndex]}
              headingText={
                matches[paraIndex] !== undefined
                  ? question.headings[matches[paraIndex]]
                  : null
              }
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

function DraggableHeading({ heading, headingIndex }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { headingIndex },
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
        <span className="font-bold">
          {String.fromCharCode(65 + headingIndex)}.
        </span>{' '}
        {heading}
      </p>
    </Card>
  );
}

function DroppableParagraph({
  paragraph,
  paraIndex,
  headingIndex,
  headingText,
  onDrop
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item) => onDrop(item.headingIndex, paraIndex),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`p-4 border rounded-md ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <Card className="p-4">
        <p className="text-sm whitespace-pre-line">{paragraph}</p>
      </Card>
      <div className="mt-2">
        <Label>Matched Heading:</Label>
        <div className="p-2 border rounded-md min-h-[2rem]">
          {headingText ? (
            <span className="font-bold">
              {String.fromCharCode(65 + headingIndex)}. {headingText}
            </span>
          ) : (
            <span className="text-gray-400">Drag a heading here</span>
          )}
        </div>
      </div>
    </div>
  );
}
