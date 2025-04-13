import React, { useMemo } from "react";
import QuestionRenderer from "./question-renderer";
import type { Question } from "@/lib/types";

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
              {question.scoringStrategy === "partial"
                ? `Question ${question.index + 1} - ${
                    question.partialEndingIndex + 1
                  }`
                : `Question ${question.index + 1}`}
            </p>
          </span>
          <QuestionRenderer question={question} sectionId={sectionId} />
        </div>
      ))}
    </div>
  );
};

export default SectionQuestionsRenderer;
