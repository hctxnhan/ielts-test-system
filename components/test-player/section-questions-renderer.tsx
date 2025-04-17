import React, { useMemo } from "react";
import QuestionRenderer from "./question-renderer";
import type { Question } from "@testComponents/lib/types";

interface SectionQuestionsRendererProps {
  questions: Question[];
  sectionId: string;
}

const SectionQuestionsRenderer: React.FC<SectionQuestionsRendererProps> = ({
  questions,
  sectionId,
}) => {
  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="border-b border-gray-300 pb-8"
          id={`question-container-${question.id}`}
        >
          <span className="flex gap-2">
            <p>
              {question.scoringStrategy === "partial" &&
              question.partialEndingIndex !== question.index
                ? `Question ${question.index + 1} - ${
                    question.partialEndingIndex + 1
                  }`
                : `Question ${question.index + 1}`}
            </p>
            {question.scoringStrategy === "partial" && (
              <p className="text-sm text-gray-500">
                (Partial question with range)
              </p>
            )}
          </span>
          <QuestionRenderer question={question} sectionId={sectionId} />
        </div>
      ))}
    </div>
  );
};

export default SectionQuestionsRenderer;
