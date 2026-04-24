import type { Question } from "@testComponents/lib/types";
import React, { useMemo, useState, useCallback } from "react";
import QuestionRenderer from "./question-renderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";

interface SectionQuestionsRendererProps {
  questions: Question[];
  sectionId: string;
  isReviewMode?: boolean;
  answers: any;
  onQuestionContentChange?: (questionId: string, content: string) => void;
}

function SortableQuestionBlock({
  question,
  sectionId,
  isReviewMode,
  answers,
  onQuestionContentChange,
}: {
  question: Question;
  sectionId: string;
  isReviewMode: boolean;
  answers: any;
  onQuestionContentChange?: (questionId: string, content: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-300 pb-8 group ${isDragging ? "shadow-lg bg-white rounded-lg" : ""}`}
      id={`question-container-${question.id}`}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/60 opacity-40 group-hover:opacity-100 transition-opacity touch-none shrink-0"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} className="text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="flex gap-2 uppercase font-bold">
            <p>
              {question.scoringStrategy === "partial" &&
              question.partialEndingIndex !== question.index
                ? `Question ${question.index + 1} - ${
                    question.partialEndingIndex + 1
                  }. `
                : `Question ${question.index + 1}. `}
            </p>
            <p>{question.type?.split("-").join(" ")}</p>
          </span>
          <QuestionRenderer
            answers={answers}
            isReviewMode={isReviewMode}
            question={question}
            sectionId={sectionId}
            onQuestionContentChange={onQuestionContentChange}
          />
        </div>
      </div>
    </div>
  );
}

const SectionQuestionsRenderer: React.FC<SectionQuestionsRendererProps> = ({
  questions,
  sectionId,
  isReviewMode = false,
  answers,
  onQuestionContentChange,
}) => {
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Build ordered questions list
  const orderedQuestions = useMemo(() => {
    if (!orderedIds) return questions;
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    return orderedIds
      .map((id) => questionMap.get(id))
      .filter(Boolean) as Question[];
  }, [questions, orderedIds]);

  const questionIds = useMemo(
    () => orderedQuestions.map((q) => q.id),
    [orderedQuestions],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentIds = orderedIds || questions.map((q) => q.id);
      const oldIndex = currentIds.indexOf(active.id as string);
      const newIndex = currentIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        setOrderedIds(arrayMove(currentIds, oldIndex, newIndex));
      }
    },
    [orderedIds, questions],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={questionIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-8">
          {orderedQuestions.map((question) => (
            <SortableQuestionBlock
              key={question.id}
              question={question}
              sectionId={sectionId}
              isReviewMode={isReviewMode}
              answers={answers}
              onQuestionContentChange={onQuestionContentChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SectionQuestionsRenderer;
