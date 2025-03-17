"use client"

import { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { LabelingQuestion } from '@/lib/types';

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
      <div className="space-y-4">
        <p className="font-medium">{question.text}</p>
        <div
          className="relative border rounded-lg overflow-hidden"
          style={{ height: '300px' }}
        >
          <img
            src={question.imageUrl || '/placeholder.svg'}
            alt="Diagram to label"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-medium">Labels</p>
              {question.labels.map((label, labelIndex) => (
                <DroppableLabel
                  key={labelIndex}
                  label={label}
                  labelIndex={labelIndex}
                  optionIndex={matches[labelIndex]}
                  optionText={
                    matches[labelIndex] !== undefined
                      ? question.options[matches[labelIndex]]
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
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

function DraggableOption({ option, optionIndex }) {
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
      <p>{option}</p>
    </Card>
  );
}

function DroppableLabel({
  label,
  labelIndex,
  optionIndex,
  optionText,
  onDrop
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item) => onDrop(item.optionIndex, labelIndex),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div className="flex items-start space-x-2">
      <Label className="w-1/3 pt-2">{label}:</Label>
      <div
        ref={drop}
        className={`flex-1 p-2 border rounded-md min-h-[2.5rem] ${
          isOver ? 'bg-gray-100' : 'bg-white'
        }`}
      >
        {optionText ? (
          <span className="font-medium">{optionText}</span>
        ) : (
          <span className="text-gray-400">Drag an option here</span>
        )}
      </div>
    </div>
  );
}

