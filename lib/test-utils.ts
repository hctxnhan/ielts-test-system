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


  // if it's pick from a list, no matter if it's a sub-question or not, we check how many items are selected, if it's at least = to number of sub-questions, we consider it completed, else untouched
  if (question?.type === "pick-from-a-list" && question.subQuestions) {
    // Count how many sub-questions are answered
    // Check how many subquestion IDs have answers in the answers object
    const subQuestionIds = question.subQuestions.map((sq) => sq.subId);
    const selectedCount = subQuestionIds.filter(
      (id) => Boolean(answers[id]?.answer),
    ).length;

    if (selectedCount >= question.subQuestions.length) {
      return "completed";
    } else if (selectedCount > 0) {
      return "partial";
    }
    return "untouched";
  }

  if (!answer) return "untouched";

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
 * Get the status color class based on question status
 */
export function getStatusColorClass(
  status: "correct" | "partial" | "incorrect" | "untouched",
): string {
  switch (status) {
    case "correct":
      return "bg-green-500";
    case "partial":
      return "bg-amber-500";
    case "incorrect":
      return "bg-red-500";
    default:
      return "bg-gray-300";
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

    // Collect answers for both subquestions and main questions
    if (question.subQuestions?.length && question.scoringStrategy === "partial") {
      question.subQuestions.forEach((sq) => {
        const answer = answers[sq.subId];
        const questionStatus = getQuestionStatus(sq.subId, answers, question);
        if (questionStatus === "completed") {
          sectionAnswers.push(answer);
          if (answer.isCorrect) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        }
      });
    } else {
      const questionStatus = getQuestionStatus(question.id, answers, question);

      const answer = answers[question.id];
      if (questionStatus === "completed") {
        sectionAnswers.push(answer);
        if (answer.isCorrect) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
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
