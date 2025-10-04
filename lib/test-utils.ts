import { Question, UserAnswer } from "./types";
import { scoringService, ScoreCalculationOptions } from "./scoring-service";
import { 
  determineQuestionStatus, 
  normalizeScore,
  ScoreAggregationUtils 
} from "./scoring-utils";

/**
 * Get the status of a question or sub-question (completed, partial, untouched)
 * @deprecated Use determineQuestionStatus from scoring-utils instead
 */
export function getQuestionStatus(
  questionId: string,
  answers: Record<string, UserAnswer>,
  question: Question,
): "completed" | "partial" | "untouched" {
  // Use the new utility function for consistency
  return determineQuestionStatus(question, answers);
}

export function countSectionQuestion(questions: Question[]): number {


  const startQuestionIndex = questions[0].index || 0;
  const endQuestionIndex =
    questions[questions.length - 1].partialEndingIndex ||
    questions[questions.length - 1].index ||
    0;

  return endQuestionIndex - startQuestionIndex + 1;
}

/**
 * Get the score for a question based on its scoring strategy and answers
 * Synchronous version for backwards compatibility
 */
export function getQuestionScore(
  question: Question,
  answers: Record<string, UserAnswer>,
): { score: number; maxScore: number } {
  // For questions with sub-questions and partial scoring, sum up sub-question scores
  if (question.subQuestions?.length && question.scoringStrategy === "partial") {
    const { totalScore, maxPossibleScore } = ScoreAggregationUtils.calculateTotalScore(
      question.subQuestions.map(subQ => answers[subQ.subId]).filter(Boolean)
    );

    // Add remaining max scores for unanswered sub-questions
    let totalMaxScore = maxPossibleScore;
    question.subQuestions.forEach((subQ) => {
      if (!answers[subQ.subId]) {
        totalMaxScore += subQ.points || 0;
      }
    });

    return {
      score: normalizeScore(totalScore, totalMaxScore),
      maxScore: totalMaxScore,
    };
  } else {
    // For single questions, use the answer's pre-calculated score
    const answer = answers[question.id];

    if (answer) {
      return {
        score: answer.score || 0,
        maxScore: answer.maxScore || question.points || 0,
      };
    } else {
      // No answer submitted
      return {
        score: 0,
        maxScore: question.points || 0,
      };
    }
  }
}

/**
 * Get the score for a question with advanced options (async version)
 * This version supports recalculation and AI scoring
 */
export async function getQuestionScoreAdvanced(
  question: Question,
  answers: Record<string, UserAnswer>,
  options: ScoreCalculationOptions = {}
): Promise<{ score: number; maxScore: number }> {
  try {
    const result = await scoringService.calculateQuestionScore(question, answers, options);
    return {
      score: normalizeScore(result.score, result.maxScore),
      maxScore: result.maxScore,
    };
  } catch (error) {
    console.error(`Error calculating advanced score for question ${question.id}:`, error);
    // Fallback to synchronous version
    return getQuestionScore(question, answers);
  }
}

/**
 * Get test statistics (total, answered, correct, partially correct)
 */
export function getTestStats(
  test: { sections: { questions: Question[] }[] },
  answers: Record<string, UserAnswer>,
) {
  let totalQuestions = 0;
  let answeredQuestions = 0;
  let correctAnswers = 0;
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Process each section
  for (const section of test.sections) {
    const sectionStats = getSectionStats(section, answers);

    totalQuestions += sectionStats.sectionTotalQuestions;
    answeredQuestions += sectionStats.sectionAnswers.length;
    correctAnswers += sectionStats.sectionCorrectAnswers;
    totalScore += sectionStats.sectionScore;
    maxPossibleScore += sectionStats.sectionTotalScore;
  }

  const percentageScore =
    Math.round((totalScore / maxPossibleScore) * 100) || 0;

  return {
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    totalScore,
    maxPossibleScore,
    percentageScore,
  };
}

/**
 * Calculate statistics for a specific section
 */
export function getSectionStats(
  section: { questions: Question[] },
  answers: Record<string, UserAnswer>,
) {
  let sectionScore = 0;
  let sectionTotalScore = 0;
  const sectionAnswers: UserAnswer[] = [];
  let correctAnswers = 0;
  let incorrectAnswers = 0;

  // Process each question in the section
  for (const question of section.questions) {
    const { score, maxScore } = getQuestionScore(question, answers);
    sectionScore += score;
    sectionTotalScore += maxScore;
    if (question.subQuestions?.length && question.scoringStrategy === "partial") {
      // PARTIAL SCORING: Iterate through each sub-question to see if it's answered.
      // Each sub-question has its own entry in the answers object.
      question.subQuestions.forEach((sq) => {
        const answer = answers[sq.subId];
        if (answer && answer.answer) {
          // For partial scoring, check if the sub-question answer has content
          const hasContent = typeof answer.answer === "string" 
            ? answer.answer.trim() !== "" 
            : Boolean(answer.answer);
          
          if (hasContent) {
            sectionAnswers.push(answer);
            if (answer.isCorrect) {
              correctAnswers++;
            } else {
              incorrectAnswers++;
            }
          }
        }
      });
    } else {
      // ALL-OR-NOTHING & SINGLE QUESTIONS: Check the status on the main question ID.
      // getQuestionStatus handles both single answers and composite answer objects.
      const questionStatus = getQuestionStatus(question.id, answers, question);
      if (questionStatus === "completed") {
        const answer = answers[question.id];
        if (answer) {
          sectionAnswers.push(answer);
          if (answer.isCorrect) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        }
      }
    }
  }

  const sectionPercentage =
    Math.round((sectionScore / sectionTotalScore) * 100) || 0;
  const sectionTotalQuestions = countSectionQuestion(section.questions);

  const unansweredQuestions = sectionTotalQuestions - sectionAnswers.length;

  return {
    sectionAnswers,
    sectionScore,
    sectionTotalScore,
    sectionPercentage,
    sectionTotalQuestions,
    sectionUnansweredQuestions: unansweredQuestions,
    sectionCorrectAnswers: correctAnswers,
    sectionIncorrectAnswers: incorrectAnswers,
  };
}
