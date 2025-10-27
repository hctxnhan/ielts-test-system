"use client";

import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { cn } from "@testComponents/lib/utils";
import { Input } from "@testComponents/components/ui/input";

export default function InputNodeComponent({ node, editor }: NodeViewProps) {
  const {
    value: propValue, 
    onChange,
    readOnly,
    showCorrectAnswer,
    question,
  } = editor.storage.inputNode;

  const { subId } = node.attrs;

  const [internalValue, setInternalValue] = useState(
    propValue?.[subId] || ""
  );

  useEffect(() => {
    const newValue = propValue?.[subId] || "";
    if (newValue !== internalValue) {
      setInternalValue(newValue);
    }
   
  }, [propValue, subId]);

  if (!question) {
    return null;
  }

  const subQuestion = React.useMemo(
    () => question.subQuestions.find((sq) => sq.subId === subId),
    [question.subQuestions, subId]
  );

  const subQuestionIndex = React.useMemo(
    () => question.subQuestions.findIndex((sq) => sq.subId === subId),
    [question.subQuestions, subId]
  );

  if (!subQuestion) {
    return null;
  }

  const displayIndex = question.index + subQuestionIndex;
  const normalizedUserAnswer = (propValue?.[subId] || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const isCorrect =
    showCorrectAnswer &&
    subQuestion.acceptableAnswers?.some(
      (answer) =>
        answer.trim().toLowerCase().replace(/\s+/g, " ") ===
        normalizedUserAnswer
    );
  const isIncorrect = showCorrectAnswer && !isCorrect;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    setInternalValue(newValue);

    if (!readOnly) {
      const newAnswers = { ...(propValue || {}) };
      newAnswers[subQuestion.subId] = newValue;
      if (question.scoringStrategy === "partial") {
        onChange(newAnswers, subQuestion.subId);
      } else {
        onChange(newAnswers);
      }
    }
  };
  const inputStyle = {
    width: `${Math.max(
      70,
      Math.min(200, (internalValue.length || 10) * 8 + 16) 
    )}px`,
  };

  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center gap-2"
      data-tiptap-input-node="true" 
    >
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
          {displayIndex + 1}
        </div>
        <Input
          id={`blank-${subQuestion.subId}`}
          value={internalValue}
          onChange={handleInputChange}
          readOnly={readOnly}
          placeholder={readOnly ? "Not answered" : "Your answer"}
          style={inputStyle}
          className={cn(
            "inline-block h-8 text-xs mx-1 text-center border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 focus:outline-none px-0.5 py-0 placeholder:text-xs",
            isCorrect && "border-b-green-500 bg-green-50",
            isIncorrect && "border-b-red-500 bg-red-50"
          )}
        />
      </div>
      {isIncorrect && showCorrectAnswer && (
        <span className="text-green-600 text-sm whitespace-nowrap mr-2">
          ✓ {subQuestion.acceptableAnswers?.[0] || ""}
          {subQuestion.acceptableAnswers &&
            subQuestion.acceptableAnswers.length > 1 && (
              <span className="text-gray-500 ml-1">
                (or: {subQuestion.acceptableAnswers.slice(1).join(", ")})
              </span>
            )}
        </span>
      )}
    </NodeViewWrapper>
  );
}