"use client";
import React from "react";
import type { LabelingQuestion } from "@testComponents/lib/types";
import { useEffect, useState } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import { cn } from "@testComponents/lib/utils";
import _ from "lodash";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";

interface LabelingQuestionProps {
  question: LabelingQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
}

const ITEM_TYPE = "OPTION";

export default function LabelingQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => { },
}: LabelingQuestionProps) {
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
    <div className="space-y-6">
      <RichTextEditor
        value={question.text || ""}
        onChange={(content) => onQuestionHighlighted(question.id, content)}
        readonly={true}
        className={cn(
          "leading-relaxed w-full h-full",
        )}
        minHeight={20}
      />
      {/* <div className="relative border rounded-lg overflow-hidden bg-gray-50 flex justify-center">
        <img
          src={question.imageUrl || "/placeholder.svg"}
          alt="Diagram to label"
          className="max-h-[500px] object-contain"
        />
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(250px,1fr)_minmax(250px,1fr)] gap-6">
        <div className="space-y-4">
          <p className="font-medium text-base md:text-lg">Options</p>
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((option, optionIndex) => (
              <DraggableItem
                key={option.id}
                text={option.text}
                index={option.id}
                itemType={ITEM_TYPE}
                // prefix={String.fromCharCode(65 + optionIndex) + "."}
                disabled={readOnly}
                className="hover:shadow-md transition-shadow duration-200"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-medium text-base md:text-lg">Labels</p>
          <div className="grid gap-4">
            {question.labels.map((label, labelIndex) => {
              const subQuestion = question.subQuestions?.find(
                (sq) => sq.item === label.id,
              );

              if (!subQuestion) {
                console.error("No subQuestion found for item:", label.id);
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
                <div key={label.id} className="flex flex-col gap-2">
                  <Label className="text-gray-700">
                    {question.scoringStrategy === "partial" && subQuestion
                      ? `Question ${question.index + labelIndex + 1}.`
                      : `${labelIndex + 1}.`}{" "}
                    {label.text}
                  </Label>
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <DroppableZone
                        key={subQuestion.subId}
                        subQuestionId={subQuestion.subId}
                        matchedId={matches[subQuestion.subId]}
                        matchedText={matchedOption?.text}
                        // prefix={
                        //   matchedOption
                        //     ? String.fromCharCode(
                        //         65 +
                        //           question.options.findIndex(
                        //             (o) => o.id === matchedOption.id,
                        //           ),
                        //       ) + "."
                        //     : ""
                        // }
                        onDrop={handleDrop}
                        itemType={ITEM_TYPE}
                        placeholder={
                          showCorrectAnswer
                            ? "Not answered"
                            : "Drag an option here"
                        }
                        disabled={readOnly}
                        className={cn(
                          "border rounded-lg shadow-sm hover:shadow transition-shadow duration-200",
                          isCorrect && "border-green-500 bg-green-50",
                          isIncorrect && "border-red-500 bg-red-50",
                        )}
                      />
                    </div>
                    {isIncorrect && showCorrectAnswer && correctOption && (
                      <div className="text-sm text-green-600 whitespace-nowrap">
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
