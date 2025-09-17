import { Question, UserAnswer } from "./types";

/**
 * Get the status of a question or sub-question (completed, partial, untouched)
 */
export function getQuestionStatus(
  questionId: string,
  answers: Record<string, UserAnswer>,
  question: Question,
): "completed" | "partial" | "untouched" {
  const answer = answers[questionId];

  if (!answer) return "untouched";

  // For all-or-nothing questions, if there's an answer object, it's completed
  // (the scoring logic has already determined if it's correct/incorrect)
  if (question.scoringStrategy === "all-or-nothing") {
    // Check if the answer has any content
    if (typeof answer.answer === "object" && answer.answer !== null && !Array.isArray(answer.answer)) {
      const hasContent = Object.values(answer.answer).some(v => Boolean(v) && (typeof v === "string" ? v.trim() !== "" : true));
      return hasContent ? "completed" : "untouched";
    }
    if (typeof answer.answer === "string") {
      return answer.answer.trim() !== "" ? "completed" : "untouched";
    }
    // For other types of answers, if it exists, it's completed
    return Boolean(answer.answer) ? "completed" : "untouched";
  }

  // For partial scoring questions with sub-questions, check how many are answered
  if (question.subQuestions && question.subQuestions.length > 0 && question.scoringStrategy === "partial") {
    if (typeof answer.answer === "object" && answer.answer !== null && !Array.isArray(answer.answer)) {
      const answeredCount = Object.values(answer.answer).filter(
        (v) => Boolean(v) && (typeof v === "string" ? v.trim() !== "" : true),
      ).length;

      if (answeredCount >= question.subQuestions.length) {
        return "completed";
      }
      if (answeredCount > 0) {
        return "partial";
      }
      return "untouched";
    }
  }

  // For simple questions without sub-questions
  if (
    (typeof answer.answer === "object" &&
      Object.values(answer.answer).filter((v) => Boolean(v)).length === 0) ||
    (typeof answer.answer === "string" &&
      (answer.answer as string).trim() === "")
  ) {
    return "untouched";
  }

  return "completed";
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
 */
export function getQuestionScore(
  question: Question,
  answers: Record<string, UserAnswer>,
): { score: number; maxScore: number } {
  // For questions with sub-questions and partial scoring, sum up sub-question scores
  if (question.subQuestions?.length && question.scoringStrategy === "partial") {
    let totalScore = 0;
    let totalMaxScore = 0;
    
    question.subQuestions.forEach((subQ) => {
      const answer = answers[subQ.subId];
      if (answer) {
        totalScore += answer.score || 0;
        totalMaxScore += answer.maxScore || subQ.points || 0;
      } else {
        // No answer submitted for this sub-question
        totalMaxScore += subQ.points || 0;
      }
    });
    
    return {
      score: totalScore,
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
