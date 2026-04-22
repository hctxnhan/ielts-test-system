'use client';

import { Button } from '@testComponents/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@testComponents/components/ui/card';
import { Progress } from '@testComponents/components/ui/progress';
import { SectionResult, Test, TestResult, Question, Section, MultipleChoiceQuestion } from '@testComponents/lib/types';
import { BarChart3, CheckCircle2, ChevronDown, ChevronLeft, Clock, Eye, EyeOff, Minus, Search, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import TestReview from './test-review-container';
import { RichTextEditor } from '../ui/rich-text-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { useParams } from 'next/navigation';
import { ProgressLink } from '../ui/progress-link';
import { getIeltsBandScore } from '@testComponents/utils/calculatingBandScore';
import _ from 'lodash';

// Helper function to determine color based on percentage score
const getScoreColorClass = (percentage: number) => {
  if (percentage == 0) return 'bg-neutral-200';
  if (percentage >= 70) return 'text-green-500';
  if (percentage >= 50) return 'text-amber-500';
  return 'text-rose-500';
};

// Helper to strip HTML tags for plain text display
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}


// ScoreCircle component - focuses on correct answers count
const ScoreCircle = ({ correct, total, percentage }: { correct: number; total: number; percentage: number }) => {
  const colorClass = getScoreColorClass(percentage);

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{correct}</span>
        <span className="text-xs sm:text-sm text-muted-foreground">/ {total} câu đúng</span>
        <span className="text-xs text-muted-foreground mt-0.5">({percentage}%)</span>
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-muted stroke-current"
          strokeWidth="6"
          fill="transparent"
          r="46"
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="transparent"
          r="46"
          cx="50"
          cy="50"
          strokeDasharray={`${2 * Math.PI * 46}`}
          strokeDashoffset={`${2 * Math.PI * 46 * (1 - percentage / 100)}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  );
};

// MetricCard component for the time, accuracy, and completion metrics
const MetricCard = ({
  icon: Icon,
  title,
  value,
  iconColor = 'text-primary'
}: {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  iconColor?: string;
}) => (
  <div className="flex flex-col items-center gap-3 bg-muted/50 border border-muted p-4 sm:p-5 lg:p-6 rounded-lg hover:bg-muted/70 transition-colors">
    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${iconColor} shrink-0`} />
    <div className="text-center">
      <div className="font-bold text-sm sm:text-base lg:text-lg mb-1">{title}</div>
      <div className="text-muted-foreground font-semibold text-base sm:text-lg lg:text-xl">{value}</div>
    </div>
  </div>
);

// SectionPerformance component - focuses on correct answers
const SectionPerformance = ({ section, skill }: { section: SectionResult, skill: string }) => {
  if (!section) return null;
  const answered = section.totalCount - section.unansweredCount;
  return (
    <div
      key={section.id}
      className="p-3 border rounded-md flex flex-col sm:flex-row sm:items-center gap-2"
    >
      <div className="sm:w-1/4 mb-1 sm:mb-0">
        <h4 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
          {section.title}
        </h4>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          {skill !== 'writing' && (
            <span className="text-sm font-semibold">
              {section.totalScore?.toFixed(0)}/{Math.round(section.totalCount)} câu đúng
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {answered}/{section.totalCount} đã trả lời
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Progress
            value={section?.percentageScore}
            className={`h-2 flex-1 bg-muted ${getScoreColorClass(
              section.percentageScore
            )}`}
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {section.percentageScore}%
          </span>
        </div>
      </div>
    </div>
  );
};

export interface TestResultsProps {
  currentTest: Test;
  testResults: TestResult;
  isExercise?: boolean,
  feedback?: string
}

// Helper to extract correct answer text for a question
function getCorrectAnswerText(question: Question, subQuestionId?: string): string {
  if (question.type === 'multiple-choice') {
    const mcq = question as MultipleChoiceQuestion;
    const correct = mcq.options.find(o => o.isCorrect);
    return correct?.text ? stripHtml(correct.text) : '—';
  }

  // Writing tasks - show suggested/sample answer snippet
  if (question.type === 'writing-task1' || question.type === 'writing-task2') {
    const wq = question as any;
    const answer = wq.suggestedAnswer || wq.sampleAnswer || '';
    if (answer) {
      const plain = stripHtml(answer);
      return plain.length > 80 ? plain.slice(0, 80) + '...' : plain;
    }
    return '—';
  }

  if (question.subQuestions && subQuestionId) {
    const sub = question.subQuestions.find(s => s.subId === subQuestionId);
    if (sub) {
      if (sub.answerText) return stripHtml(sub.answerText);
      if ('correctAnswer' in sub && (sub as any).correctAnswer) return stripHtml(String((sub as any).correctAnswer));
      if ('acceptableAnswers' in sub && Array.isArray((sub as any).acceptableAnswers)) {
        return (sub as any).acceptableAnswers.map((a: string) => stripHtml(a)).join(' / ');
      }
    }
  }

  return '—';
}

// Helper to get user's answer text for single-answer questions
function getUserAnswerText(question: Question, answer: any): string {
  if (!answer && answer !== 0) return '—';

  if (question.type === 'multiple-choice') {
    const mcq = question as MultipleChoiceQuestion;
    const selected = mcq.options.find(o => o.id === answer);
    return selected?.text ? stripHtml(selected.text) : stripHtml(String(answer));
  }

  // Writing tasks - show user's text snippet
  if (question.type === 'writing-task1' || question.type === 'writing-task2') {
    const text = typeof answer === 'object' && answer?.text ? answer.text : String(answer);
    const plain = stripHtml(text);
    return plain.length > 80 ? plain.slice(0, 80) + '...' : plain;
  }

  return stripHtml(String(answer));
}

// Helper to find a user's answer for a sub-question from the answers record
function findSubQuestionAnswer(
  answers: Record<string, any>,
  questionId: string,
  subQuestionId: string
): { userAnswer: any; isCorrect: boolean | undefined; isAnswered: boolean; rawAnswer: any } {
  // Case 0: subQuestionId === questionId (e.g. multiple-choice after transform)
  if (subQuestionId === questionId && answers[questionId] && !answers[questionId].parentQuestionId) {
    const ans = answers[questionId];
    return {
      userAnswer: ans,
      isCorrect: ans.isCorrect,
      isAnswered: true,
      rawAnswer: ans.answer,
    };
  }

  // Case 1: Individual sub-answer stored under subQuestionId key
  if (answers[subQuestionId] && answers[subQuestionId].parentQuestionId === questionId) {
    return {
      userAnswer: answers[subQuestionId],
      isCorrect: answers[subQuestionId].isCorrect,
      isAnswered: true,
      rawAnswer: answers[subQuestionId].answer,
    };
  }

  // Case 2: Main answer stored under questionId with Record<subId, value>
  const mainAnswer = answers[questionId];
  if (mainAnswer) {
    const mainAnswerValue = mainAnswer.answer;
    // If the main answer is a record containing sub-answers
    if (typeof mainAnswerValue === 'object' && mainAnswerValue !== null && subQuestionId in mainAnswerValue) {
      return {
        userAnswer: mainAnswer,
        isCorrect: mainAnswer.isCorrect, // For all-or-nothing, this is the overall result
        isAnswered: !!mainAnswerValue[subQuestionId],
        rawAnswer: mainAnswerValue,
      };
    }
  }

  // Case 3: Search all answers for one with matching parentQuestionId and subQuestionId
  for (const [_key, ans] of Object.entries(answers)) {
    if (ans && ans.parentQuestionId === questionId && ans.subQuestionId === subQuestionId) {
      return {
        userAnswer: ans,
        isCorrect: ans.isCorrect,
        isAnswered: true,
        rawAnswer: ans.answer,
      };
    }
  }

  return { userAnswer: null, isCorrect: undefined, isAnswered: false, rawAnswer: null };
}

// Helper to get user answer display text for sub-questions
function getSubAnswerDisplayText(question: Question, rawAnswer: any, subQuestionId: string): string {
  if (!rawAnswer && rawAnswer !== 0) return '—';

  // For multiple-choice: rawAnswer is the option ID string directly
  if (question.type === 'multiple-choice') {
    const mcq = question as MultipleChoiceQuestion;
    const selected = mcq.options.find(o => o.id === rawAnswer);
    return selected?.text ? stripHtml(selected.text) : stripHtml(String(rawAnswer));
  }

  // For writing tasks: rawAnswer is { text: "...", score: ..., feedback: "..." } or a string
  if (question.type === 'writing-task1' || question.type === 'writing-task2') {
    const text = typeof rawAnswer === 'object' && rawAnswer?.text ? rawAnswer.text : String(rawAnswer);
    const plain = stripHtml(text);
    return plain.length > 80 ? plain.slice(0, 80) + '...' : (plain || '—');
  }

  let val = rawAnswer;
  // If rawAnswer is a Record (from main answer), extract the sub value
  if (typeof rawAnswer === 'object' && rawAnswer !== null && subQuestionId in rawAnswer) {
    val = rawAnswer[subQuestionId];
  }
  if (!val && val !== 0) return '—';

  // Resolve option/heading/item text for matching-type questions
  if ('options' in question && Array.isArray((question as any).options)) {
    const opt = (question as any).options.find((o: any) => o.id === val);
    if (opt?.text) return opt.text;
  }
  if ('headings' in question && Array.isArray((question as any).headings)) {
    const heading = (question as any).headings.find((h: any) => h.id === val);
    if (heading?.text) return heading.text;
  }
  if ('items' in question && Array.isArray((question as any).items)) {
    const item = (question as any).items.find((i: any) => i.id === val);
    if (item?.text) return item.text;
  }

  // Fallback: handle objects gracefully
  if (typeof val === 'object' && val !== null) {
    if (val.text) return stripHtml(String(val.text));
    return '—';
  }

  return stripHtml(String(val));
}

// AnswerDetailTable component - shows correct answers grouped by section/question block
const AnswerDetailTable = ({ currentTest, testResults }: { currentTest: Test; testResults: TestResult }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const answers = testResults.answers || {};

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return (
    <div className="space-y-3">
      {currentTest.sections.map((section: Section) => {
        const isExpanded = expandedSections[section.id] !== false; // default expanded

        return (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
            >
              <span className="font-semibold text-sm">{section.title}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/20 border-b">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground w-12">#</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Câu hỏi</th>
                      <th className="text-left px-3 py-2 font-medium text-green-600">Đáp án đúng</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Câu trả lời</th>
                      <th className="text-center px-3 py-2 font-medium text-muted-foreground w-16">KQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.questions.map((question: Question) => {
                      const questionTitle = question.text
                        ? `Q${question.index + 1}${question.partialEndingIndex > question.index ? `–${question.partialEndingIndex + 1}` : ''}. ${question.type.replace(/-/g, ' ').toUpperCase()}`
                        : null;

                      // Questions with subQuestions (matching, completion, TFNG, etc.)
                      if (question.subQuestions && question.subQuestions.length > 0) {
                        return (
                          <React.Fragment key={question.id}>
                            {questionTitle && (
                              <tr className="bg-muted/30 border-b">
                                <td colSpan={5} className="px-4 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                                  {questionTitle}
                                </td>
                              </tr>
                            )}
                            {question.subQuestions.map((sub, subIdx) => {
                              const { isCorrect, isAnswered, rawAnswer } = findSubQuestionAnswer(answers, question.id, sub.subId);
                              const isCompletion = question.type === 'completion' || question.type === 'short-answer';
                              const questionLabel = isCompletion
                                ? ''
                                : stripHtml(sub.questionText || sub.item || `Câu ${(sub.subIndex ?? subIdx) + 1}`);
                              const correctText = getCorrectAnswerText(question, sub.subId);
                              const userText = isAnswered
                                ? getSubAnswerDisplayText(question, rawAnswer, sub.subId)
                                : '—';

                              return (
                                <tr key={`${question.id}-${sub.subId}`} className="border-b last:border-b-0 hover:bg-muted/10">
                                  <td className="px-4 py-2 text-muted-foreground">{question.index + (sub.subIndex ?? subIdx) + 1}</td>
                                  <td className="px-3 py-2 max-w-[200px] truncate" title={questionLabel}>{questionLabel}</td>
                                  <td className="px-3 py-2 text-green-700 font-medium max-w-[200px] truncate" title={correctText}>{correctText}</td>
                                  <td className={`px-3 py-2 max-w-[200px] truncate ${isAnswered && !isCorrect ? 'text-rose-600' : ''}`} title={userText}>{userText}</td>
                                  <td className="text-center px-3 py-2">
                                    {!isAnswered ? (
                                      <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                                    ) : isCorrect ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-rose-500 mx-auto" />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      }

                      // Single-answer questions (multiple-choice, etc.)
                      const userAnswer = answers[question.id];
                      const isCorrect = userAnswer?.isCorrect;
                      const isAnswered = !!userAnswer;
                      const correctText = getCorrectAnswerText(question);
                      const userText = isAnswered
                        ? getUserAnswerText(question, userAnswer?.answer)
                        : '—';

                      return (
                        <React.Fragment key={question.id}>
                          {questionTitle && (
                            <tr className="bg-muted/30 border-b">
                              <td colSpan={5} className="px-4 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                                {questionTitle}
                              </td>
                            </tr>
                          )}
                          <tr className="border-b last:border-b-0 hover:bg-muted/10">
                            <td className="px-4 py-2 text-muted-foreground">{question.index + 1}</td>
                            <td className="px-3 py-2 max-w-[200px] truncate" title={stripHtml(question.text)}>{stripHtml(question.text) || `Câu ${question.index + 1}`}</td>
                            <td className="px-3 py-2 text-green-700 font-medium max-w-[200px] truncate" title={correctText}>{correctText}</td>
                            <td className={`px-3 py-2 max-w-[200px] truncate ${isAnswered && !isCorrect ? 'text-rose-600' : ''}`} title={userText}>{userText}</td>
                            <td className="text-center px-3 py-2">
                              {!isAnswered ? (
                                <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                              ) : isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-rose-500 mx-auto" />
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function TestResults({ currentTest, testResults, isExercise = false, feedback }: TestResultsProps) {
  const [showReview, setShowReview] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const params = useParams();

  if (!currentTest) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>No test results available.</p>
      </div>
    );
  }

  const startTime = new Date(testResults.startedAt).getTime();
  const endTime = testResults.completedAt
    ? new Date(testResults.completedAt).getTime()
    : new Date().getTime();

  const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);
  const timeTakenMinutes = Math.floor(timeTakenSeconds / 60);
  const remainingSeconds = timeTakenSeconds % 60;

  const {
    correctAnswers,
    percentageScore: scorePercentage
  } = testResults;


  // const estimatedBandScore = useMemo(() => {
  //   const band = scorePercentage / 11.1;
  //   const roundedBand = Math.round(band * 10) / 10;
  //   return Math.min(9, Math.max(0, roundedBand));
  // }, [scorePercentage]);

  let estimatedBandScore = useMemo(() => {
    let type: string = _.toLower(currentTest.type) || _.toLower(currentTest.skill)
    if (type != 'reading' && type != 'listening') return null
    if (type = 'reading') type = 'academic_reading'
    const band = getIeltsBandScore(type, correctAnswers)
    return band
  }, [scorePercentage]);

  return (
    <>
      {isExercise && params.id &&
        <div className='mb-4'>
          <ProgressLink href={`/classes/${params.id}`} className="group">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back</span>
            </Button>
          </ProgressLink>

        </div>

      }
      <Card className="overflow-hidden border-2 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4 px-4 sm:px-8 py-6 sm:py-8">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl flex items-center justify-center font-bold">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center mr-3 sm:mr-4">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </span>
            {currentTest.title}
            {/* -{' '}
            {(currentTest.skill ?? currentTest.type ?? '').toUpperCase()} */}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 px-4 sm:px-8">
          {/* Stats Summary */}

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-10">
            <div className="flex-shrink-0">
              <ScoreCircle correct={correctAnswers} total={testResults.totalQuestions} percentage={scorePercentage} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full lg:flex-1">
              <MetricCard
                icon={Clock}
                title="Thời gian làm bài"
                value={`${timeTakenMinutes}m ${remainingSeconds}s`}
              />
              {estimatedBandScore && currentTest.type?.toLowerCase() !== 'writing' && !isExercise && (
                <MetricCard
                  icon={BarChart3}
                  title="Band Ước Tính"
                  value={`${estimatedBandScore}/${9}`}
                />
              )}
            </div>
          </div>

          {/* Answer Summary Table */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-3 flex items-center">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
              Tổng Hợp Kết Quả
            </h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Phần</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground">Tổng câu</th>
                    <th className="text-center px-3 py-2.5 font-medium text-green-600">Đúng</th>
                    <th className="text-center px-3 py-2.5 font-medium text-rose-600">Sai</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground">Chưa trả lời</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.sectionResults.map((section: SectionResult) => (
                    <tr key={section.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{section.title}</td>
                      <td className="text-center px-3 py-2.5">{section.totalCount}</td>
                      <td className="text-center px-3 py-2.5 text-green-600 font-semibold">{section.correctCount}</td>
                      <td className="text-center px-3 py-2.5 text-rose-600 font-semibold">{section.incorrectCount}</td>
                      <td className="text-center px-3 py-2.5 text-muted-foreground">{section.unansweredCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-muted/40 font-semibold">
                    <td className="px-4 py-2.5">Tổng cộng</td>
                    <td className="text-center px-3 py-2.5">{testResults.totalQuestions}</td>
                    <td className="text-center px-3 py-2.5 text-green-600">{testResults.correctAnswers}</td>
                    <td className="text-center px-3 py-2.5 text-rose-600">{testResults.totalQuestions - testResults.correctAnswers - (testResults.totalQuestions - testResults.answeredQuestions)}</td>
                    <td className="text-center px-3 py-2.5 text-muted-foreground">{testResults.totalQuestions - testResults.answeredQuestions}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Answer Detail by Section */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-3 flex items-center">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
              Chi Tiết Đáp Án Theo Phần
            </h3>
            <AnswerDetailTable currentTest={currentTest} testResults={testResults} />
          </div>

          {/* Section Breakdown */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-2 flex items-center">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
              Hiệu Suất Theo Phần
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              {testResults.sectionResults.map((section: SectionResult) => (
                <SectionPerformance key={section.id} section={section} skill={currentTest.type} />
              ))}
            </div>
            {feedback && feedback.trim() !== "" && (
              <div className="mt-2">
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="p-1 text-[#4ab266] hover:text-[#4ab266] bg-transparent hover:bg-transparent focus:outline-none"
                  title={showFeedback ? "Hide teacher feedback" : "View teacher feedback"}
                >
                  <div className='flex items-center justify-center'>
                    {showFeedback ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {showFeedback ? (
                      <span>Hide teacher feedback</span>
                    ) : (
                      <span>View teacher feedback</span>

                    )}

                  </div>


                </button>

                {showFeedback && (
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md text-sm">
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                      >
                        {feedback}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
          {/* Question Review */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowReview(true)}
              className="w-full sm:w-auto"
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Xem lại kết quả
            </Button>
          </div>
        </CardContent>
      </Card>

      {!!showReview && (
        <div className="mt-9">
          <TestReview
            test={currentTest}
            testResults={testResults}
            onBack={() => setShowReview(false)}
          />
        </div>
      )}
    </>
  );
}
