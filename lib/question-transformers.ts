import {
  CompletionQuestion,
  LabelingQuestion,
  MatchingHeadingsQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  PickFromAListQuestion,
  Question,
  SentenceTranslationQuestion,
  ShortAnswerQuestion,
  TrueFalseNotGivenQuestion,
  WordFormQuestion,
  WritingTask1Question,
  WritingTask2Question,
} from "./types";

import {
  StandardCompletionQuestion,
  StandardLabelingQuestion,
  StandardMatchingHeadingsQuestion,
  StandardMatchingQuestion,
  StandardMultipleChoiceQuestion,
  StandardPickFromListQuestion,
  StandardQuestion,
  StandardQuestionItem,
  StandardQuestionOption,
  StandardSentenceTranslationQuestion,
  StandardShortAnswerQuestion,
  StandardSubQuestionMeta,
  StandardTrueFalseNotGivenQuestion,
  StandardWordFormQuestion,
  StandardWritingTask1Question,
  StandardWritingTask2Question,
} from "./standardized-types";

// Type guards for question types
function isMultipleChoiceQuestion(
  question: Question,
): question is MultipleChoiceQuestion {
  return question.type === "multiple-choice";
}

function isCompletionQuestion(
  question: Question,
): question is CompletionQuestion {
  return question.type === "completion";
}

function isMatchingQuestion(question: Question): question is MatchingQuestion {
  return question.type === "matching";
}

function isLabelingQuestion(question: Question): question is LabelingQuestion {
  return question.type === "labeling";
}

function isPickFromAListQuestion(
  question: Question,
): question is PickFromAListQuestion {
  return question.type === "pick-from-a-list";
}

function isTrueFalseNotGivenQuestion(
  question: Question,
): question is TrueFalseNotGivenQuestion {
  return question.type === "true-false-not-given";
}

function isMatchingHeadingsQuestion(
  question: Question,
): question is MatchingHeadingsQuestion {
  return question.type === "matching-headings";
}

function isShortAnswerQuestion(
  question: Question,
): question is ShortAnswerQuestion {
  return question.type === "short-answer";
}

function isWritingTask1Question(
  question: Question,
): question is WritingTask1Question {
  return question.type === "writing-task1";
}

function isWritingTask2Question(
  question: Question,
): question is WritingTask2Question {
  return question.type === "writing-task2";
}

function isSentenceTranslationQuestion(
  question: Question,
): question is SentenceTranslationQuestion {
  return question.type === "sentence-translation";
}

function isWordFormQuestion(
  question: Question,
): question is WordFormQuestion {
  return question.type === "word-form";
}

// Transform functions for each question type
function transformMultipleChoice(
  question: MultipleChoiceQuestion,
): StandardMultipleChoiceQuestion {
  const standardItems: StandardQuestionOption[] = question.options.map(
    (opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.isCorrect,
    }),
  );

  const correctOption = standardItems.find((opt) => opt.isCorrect);
  const subQuestion: StandardSubQuestionMeta = {
    subId: question.id,
    points: question.points,
    item: question.id,
    questionText: question.text,
    answerText: correctOption?.text,
    correctAnswer: correctOption?.id,
  };

  return {
    ...question,
    scoringStrategy: "partial",
    items: standardItems,
    subQuestions: [subQuestion],
  } as StandardMultipleChoiceQuestion;
}

function transformMatching(
  question: MatchingQuestion,
): StandardMatchingQuestion {
  const standardItems: StandardQuestionItem[] = question.items.map((item) => ({
    id: item.id,
    text: item.text,
  }));

  const standardOptions: StandardQuestionOption[] = question.options.map(
    (opt) => ({
      id: opt.id,
      text: opt.text,
    }),
  );

  const standardSubQuestions: StandardSubQuestionMeta[] =
    question.subQuestions.map((sub) => ({
      subId: sub.subId,
      item: sub.item,
      points: sub.points,
      correctAnswer: sub.correctAnswer,
      questionText: standardItems.find((item) => item.id === sub.item)?.text,
      answerText: standardOptions.find((opt) => opt.id === sub.correctAnswer)
        ?.text,
    }));

  return {
    ...question,
    items: standardItems,
    options: standardOptions,
    subQuestions: standardSubQuestions,
  } as StandardMatchingQuestion;
}

function transformLabeling(
  question: LabelingQuestion,
): StandardLabelingQuestion {
  const standardItems: StandardQuestionItem[] = question.labels.map(
    (label) => ({
      id: label.id,
      text: label.text,
    }),
  );

  const standardOptions: StandardQuestionOption[] = question.options.map(
    (opt) => ({
      id: opt.id,
      text: opt.text,
    }),
  );

  const standardSubQuestions: StandardSubQuestionMeta[] =
    question.subQuestions.map((sub) => ({
      subId: sub.subId,
      item: sub.item,
      points: sub.points,
      correctAnswer: sub.correctAnswer,
      questionText: standardItems.find((item) => item.id === sub.item)?.text,
      answerText: standardOptions.find((opt) => opt.id === sub.correctAnswer)
        ?.text,
    }));

  return {
    ...question,
    items: standardItems,
    options: standardOptions,
    subQuestions: standardSubQuestions,
  } as StandardLabelingQuestion;
}

function transformCompletion(
  question: CompletionQuestion,
): StandardCompletionQuestion {
  const standardSubQuestions: StandardSubQuestionMeta[] =
    question.subQuestions.map((sub) => ({
      subId: sub.subId,
      points: sub.points,
      acceptableAnswers: sub.acceptableAnswers,
      questionText: question.text,
    }));

  return {
    ...question,
    subQuestions: standardSubQuestions,
  } as StandardCompletionQuestion;
}

function transformPickFromList(
  question: PickFromAListQuestion,
): StandardPickFromListQuestion {
  const standardItems: StandardQuestionItem[] = question.items.map((item) => ({
    id: item.id,
    text: item.text,
  }));

  // Handle subquestions - each represents a correct item
  const standardSubQuestions: StandardSubQuestionMeta[] = [];

  if (question.subQuestions && question.subQuestions.length > 0) {
    for (const sub of question.subQuestions) {
      const itemId = sub.item || "";
      const itemData = standardItems.find((item) => item.id === itemId);

      standardSubQuestions.push({
        subId: sub.subId,
        item: itemId,
        points: sub.points,
        correctAnswer: "true", // Using "true" to indicate this item is correct
        questionText: itemData?.text || "",
        answerText: itemData?.text || "", // The answer is the item itself since it's marked as correct
      });
    }
  }

  return {
    ...question,
    items: standardItems,
    subQuestions: standardSubQuestions,
  } as StandardPickFromListQuestion;
}

function transformTrueFalseNotGiven(
  question: TrueFalseNotGivenQuestion,
): StandardTrueFalseNotGivenQuestion {
  const standardItems: StandardQuestionItem[] = question.statements.map(
    (stmt) => ({
      id: stmt.id,
      text: stmt.text,
    }),
  );

  const standardSubQuestions: StandardSubQuestionMeta[] =
    question.subQuestions.map((sub) => ({
      subId: sub.subId,
      item: sub.item,
      points: sub.points,
      correctAnswer: sub.correctAnswer,
      questionText: standardItems.find((item) => item.id === sub.item)?.text,
      answerText: String(sub.correctAnswer),
    }));

  return {
    ...question,
    items: standardItems,
    subQuestions: standardSubQuestions,
  } as StandardTrueFalseNotGivenQuestion;
}

function transformMatchingHeadings(
  question: MatchingHeadingsQuestion,
): StandardMatchingHeadingsQuestion {
  const standardOptions: StandardQuestionItem[] = question.paragraphs.map(
    (para) => ({
      id: para.id,
      text: para.text,
    }),
  );

  const standardItems: StandardQuestionOption[] = question.headings.map(
    (head) => ({
      id: head.id,
      text: head.text,
    }),
  );

  const standardSubQuestions: StandardSubQuestionMeta[] =
    question.subQuestions.map((sub) => ({
      subId: sub.subId,
      item: sub.item,
      points: sub.points,
      correctAnswer: sub.correctAnswer,
      questionText: standardOptions.find((item) => item.id === sub.item)?.text,
      answerText: standardItems.find((opt) => opt.id === sub.correctAnswer)
        ?.text,
    }));

  return {
    ...question,
    items: standardItems,
    options: standardOptions,
    subQuestions: standardSubQuestions,
  } as StandardMatchingHeadingsQuestion;
}

function transformShortAnswer(
  question: ShortAnswerQuestion,
): StandardShortAnswerQuestion {
  const standardItems: StandardQuestionItem[] = question.questions.map((q) => ({
    id: q.id,
    text: q.text,
  }));

  const standardSubQuestions: StandardSubQuestionMeta[] =
    question.subQuestions.map((sub) => {
      const shortAnswerSub = sub as any;
      return {
        subId: sub.subId,
        item: sub.item,
        points: sub.points,
        correctAnswer: shortAnswerSub.acceptableAnswers,
        questionText: standardItems.find((item) => item.id === sub.item)?.text,
        answerText: shortAnswerSub.acceptableAnswers?.join(", "),
        acceptableAnswers: shortAnswerSub.acceptableAnswers,
      };
    });

  return {
    ...question,
    items: standardItems,
    subQuestions: standardSubQuestions,
    wordLimit: question.wordLimit,
  } as StandardShortAnswerQuestion;
}

function transformWritingTask(
  question: WritingTask1Question | WritingTask2Question,
): StandardWritingTask1Question | StandardWritingTask2Question {
  const standardSubQuestions: StandardSubQuestionMeta[] = [
    {
      subId: question.id,
      points: question.points,
      questionText: question.text,
      answerText: question.sampleAnswer,
    },
  ];

  return {
    ...question,
    scoringStrategy: "partial",
    subQuestions: standardSubQuestions,
  } as StandardWritingTask1Question | StandardWritingTask2Question;
}

function transformSentenceTranslation(
  question: SentenceTranslationQuestion,
): StandardSentenceTranslationQuestion {
  // Handle both formats: questions with single sourceText and questions with sentences array
  const questionData = question as any; // Cast to access both possible properties
  
  if (questionData.sourceText) {
    // Single sentence format (from sample tests)
    return {
      ...question,
      sourceText: questionData.sourceText,
      referenceTranslation: questionData.referenceTranslation,
      sourceLanguage: question.sourceLanguage,
      targetLanguage: question.targetLanguage,
      scoringPrompt: question.scoringPrompt,
      scoringStrategy: "partial",
      subQuestions: [
        {
          subId: question.id,
          points: question.points,
          questionText: questionData.sourceText,
          answerText: questionData.referenceTranslation,
        },
      ],
    } as StandardSentenceTranslationQuestion;
  } else if (question.sentences && question.sentences.length > 0) {
    // Multiple sentences format
    const firstSentence = question.sentences[0];
    const standardSubQuestions: StandardSubQuestionMeta[] = question.sentences.map((sentence, index) => ({
      subId: sentence.id,
      points: question.points / question.sentences.length,
      questionText: sentence.sourceText,
      answerText: sentence.referenceTranslations?.[0] || "",
      subIndex: index,
    }));

    return {
      ...question,
      sourceText: firstSentence.sourceText,
      referenceTranslation: firstSentence.referenceTranslations?.[0] || "",
      sourceLanguage: question.sourceLanguage,
      targetLanguage: question.targetLanguage,
      scoringPrompt: question.scoringPrompt,
      scoringStrategy: "partial",
      subQuestions: standardSubQuestions,
    } as StandardSentenceTranslationQuestion;
  }
  
  // Fallback for empty questions
  return {
    ...question,
    sourceText: "",
    referenceTranslation: "",
    sourceLanguage: question.sourceLanguage,
    targetLanguage: question.targetLanguage,
    scoringPrompt: question.scoringPrompt,
    scoringStrategy: "partial",
    subQuestions: [],
  } as StandardSentenceTranslationQuestion;
}

function transformWordForm(
  question: WordFormQuestion,
): StandardWordFormQuestion {
  const exercises = question.exercises || [];
  
  const standardSubQuestions: StandardSubQuestionMeta[] = exercises.map((exercise, index) => ({
    subId: exercise.id,
    points: question.points / Math.max(exercises.length, 1),
    questionText: exercise.sentence,
    answerText: exercise.correctForm,
    subIndex: index,
    correctAnswer: exercise.correctForm,
  }));

  return {
    ...question,
    exercises: exercises.map(ex => ({
      id: ex.id,
      sentence: ex.sentence,
      baseWord: ex.baseWord,
      correctForm: ex.correctForm,
    })),
    scoringStrategy: "partial",
    subQuestions: standardSubQuestions,
  } as StandardWordFormQuestion;
}

// Update the main transform function
export function transformToStandardQuestion(
  question: Question,
): StandardQuestion {
  if (isMultipleChoiceQuestion(question)) {
    return transformMultipleChoice(question);
  }
  if (isCompletionQuestion(question)) {
    return transformCompletion(question);
  }
  if (isMatchingQuestion(question)) {
    return transformMatching(question);
  }
  if (isLabelingQuestion(question)) {
    return transformLabeling(question);
  }
  if (isPickFromAListQuestion(question)) {
    return transformPickFromList(question); // Use the same transformer for both types
  }
  if (isTrueFalseNotGivenQuestion(question)) {
    return transformTrueFalseNotGiven(question);
  }
  if (isMatchingHeadingsQuestion(question)) {
    return transformMatchingHeadings(question);
  }
  if (isShortAnswerQuestion(question)) {
    return transformShortAnswer(question);
  }
  if (isWritingTask1Question(question) || isWritingTask2Question(question)) {
    return transformWritingTask(question);
  }
  if (isSentenceTranslationQuestion(question)) {
    return transformSentenceTranslation(question);
  }
  if (isWordFormQuestion(question)) {
    return transformWordForm(question);
  }

  throw new Error(`Unsupported question type: ${question.type}`);
}
