import React, { useMemo } from 'react';
import QuestionRenderer from './question-renderer';
import type { Question } from '@/lib/types';

interface SectionQuestionsRendererProps {
  questions: Question[];
  sectionId: string;
}

const SectionQuestionsRenderer: React.FC<SectionQuestionsRendererProps> = ({ questions, sectionId }) => {
  return (
    <div className='space-y-8'>
      {questions.map((question, index) => (
        <div key={question.id} className='border-b border-gray-300 pb-8'>
          <span className='flex gap-2'><p>
            {question.scoringStrategy === 'partial' ? `Question ${question.index} - ${question.partialEndingIndex}` : `Question ${question.index}`}
          </p> [{question.type?.toUpperCase()}] [{question.scoringStrategy}]</span>
          <QuestionRenderer question={question} sectionId={sectionId} />
        </div>
      ))}
    </div>
  );
};

export default SectionQuestionsRenderer;
