"use client";
import React, { useEffect, useState } from "react";
import type { MatchingQuestion } from "@testComponents/lib/types";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import { cn } from "@testComponents/lib/utils";
import _ from "lodash";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";

interface MatchingQuestionProps {
  question: MatchingQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
}

const ITEM_TYPE = "OPTION";

export default function MatchingQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => { },
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});


  useEffect(() => {
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionId: string, subQuestionId: string) => {
    if (readOnly) return;

    setMatches((prevMatches) => {
      const updatedMatches = { ...prevMatches };
      updatedMatches[subQuestionId] = optionId;

      if (question.scoringStrategy === "partial") {
        onChange(updatedMatches, subQuestionId);
      } else {
        onChange(updatedMatches);
      }

      return updatedMatches;
    });
  };

  return (
    <div className="mx-auto space-y-6">
      <RichTextEditor
        value={question.text || ""}
        onChange={(content) => onQuestionHighlighted(question.id, content)}
        readonly={true}
        className="leading-relaxed w-full h-full"
        minHeight={20}
      />

      {/* Aligning questions and options side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start md:items-stretch">
        {/* Left column: Questions */}
        <div className="space-y-5">
          {question.items.map((item, index) => {
            const subQuestion = question.subQuestions?.find(
              (sq) => sq.item === item.id,
            );

            if (!subQuestion) {
              console.error("No subQuestion found for item:", item.id);
              return null;
            }

            const matchedOption = question.options.find(
              (opt) => opt.id === matches[subQuestion.subId],
            );

            const isCorrect =
              showCorrectAnswer &&
              matchedOption?.id === subQuestion.correctAnswer;

            const isIncorrect =
              showCorrectAnswer &&
              (!matchedOption ||
                matchedOption.id !== subQuestion.correctAnswer);

            const correctOption = question.options.find(
              (opt) => opt.id === subQuestion.correctAnswer,
            );

            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow transition-all"
              >
                <Label className="min-w-[180px] text-gray-900 font-semibold leading-snug">
                  {question.scoringStrategy === "partial" && subQuestion
                    ? `Question ${question.index + index + 1}.`
                    : `${index + 1}.`}{" "}
                  {item.text}
                </Label>

                <div className="flex-1 flex flex-col gap-3">
                  <div
                    className={cn(
                      "w-full rounded-md transition-all duration-200",
                      isCorrect && "border-green-500 bg-green-50",
                      isIncorrect && "border-red-500 bg-red-50",
                    )}
                  >
                    <DroppableZone
                      key={subQuestion.subId}
                      subQuestionId={subQuestion.subId}
                      matchedId={matches[subQuestion.subId]}
                      matchedText={matchedOption?.text}
                      prefix={
                        matchedOption
                          ? String.fromCharCode(
                            65 +
                            question.options.findIndex(
                              (o) => o.id === matchedOption.id,
                            ),
                          ) + "."
                          : ""
                      }
                      onDrop={handleDrop}
                      itemType={ITEM_TYPE}
                      placeholder={
                        readOnly ? "Not answered" : "Drag an option here"
                      }
                      disabled={readOnly}
                      className={cn(
                        "w-full h-11 flex items-center px-3 rounded-md border border-gray-300 bg-white text-sm hover:border-gray-400 hover:shadow-sm transition-all",
                        isCorrect && "border-green-500 bg-green-50",
                        isIncorrect && "border-red-500 bg-red-50",
                      )}
                    />
                  </div>

                  {isIncorrect && showCorrectAnswer && correctOption && (
                    <div className="text-sm flex items-center gap-1 text-green-600">
                      ✓{" "}
                      {String.fromCharCode(
                        65 +
                        question.options.findIndex(
                          (o) => o.id === correctOption.id,
                        ),
                      )}
                      . {correctOption.text}
                    </div>
                  )}
                </div>
                {!_.isEmpty(subQuestion.explanation) && readOnly && (
                  <Accordion type="single" collapsible className="mt-4 border-0 outline-none">
                    <AccordionItem value="transcript">
                      <AccordionTrigger className={cn(
                        "text-sm font-bold underline flex items-center gap-2 py-2",
                        "hover:no-underline outline-none border-0 text-blue-600"
                      )}>
                        Giải thích đáp án
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-0 outline-none">

                        <RichTextContent content={subQuestion.explanation} />

                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column: Options */}
        <div className="space-y-3">
          {question.options.map((option, optionIndex) => (
            <DraggableItem
              key={option.id}
              text={option.text}
              index={option.id}
              itemType={ITEM_TYPE}
              prefix={String.fromCharCode(65 + optionIndex) + "."}
              disabled={readOnly}
              className="w-full border border-gray-300 rounded-lg bg-gray-50 p-3 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all text-sm text-gray-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
