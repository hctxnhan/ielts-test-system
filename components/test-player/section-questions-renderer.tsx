import type { Question } from "@testComponents/lib/types";
import React from "react";
import QuestionRenderer from "./question-renderer";

interface SectionQuestionsRendererProps {
  questions: Question[];
  sectionId: string;
  isReviewMode?: boolean;
  answers: any;
}

const SectionQuestionsRenderer: React.FC<SectionQuestionsRendererProps> = ({
  questions,
  sectionId,
  isReviewMode = false,
  answers
}) => {
  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="border-b border-gray-300 pb-8"
          id={`question-container-${question.id}`}
        >
          <span className="flex gap-2 uppercase font-bold">
            <p>
              {question.scoringStrategy === 'partial' &&
              question.partialEndingIndex !== question.index
                ? `Question ${question.index + 1} - ${
                    question.partialEndingIndex + 1
                  }`
                : `Question ${question.index + 1}`}
            </p>
            <p>{question.type}</p>
          </span>
          <QuestionRenderer
            answers={answers}
            isReviewMode={isReviewMode}
            question={question}
            sectionId={sectionId}
          />
        </div>
      ))}
    </div>
  );
};

export default SectionQuestionsRenderer;
