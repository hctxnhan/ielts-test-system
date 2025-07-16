// "use client";
// import React, { useRef } from "react";
// import {
//   RadioGroup,
//   RadioGroupItem,
// } from "@testComponents/components/ui/radio-group";
// import { Label } from "@testComponents/components/ui/label";
// import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
// import type { MultipleChoiceQuestion } from "@testComponents/lib/types";
// import { cn } from "@testComponents/lib/utils";
// import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
// import { useHighlightHandler } from "@testComponents/hooks/use-highlight";
// import { getPosition } from "@testComponents/lib/get-position";

// interface MultipleChoiceQuestionProps {
//   question: MultipleChoiceQuestion;
//   value?: string;
//   onChange: (value: string, subId: string) => void;
//   readOnly?: boolean;
//   showCorrectAnswer?: boolean;
//   onQuestionHighlighted?: (questionId: string, content: string) => void;
// }

// export default function MultipleChoiceQuestion({
//   question,
//   value,
//   onChange,
//   readOnly = false,
//   showCorrectAnswer = false,
//   onQuestionHighlighted = () => {},
// }: MultipleChoiceQuestionProps) {
//   const contentRef = useRef<HTMLDivElement | null>(null);
//   const {
//     popover,
//     applyHighlight,
//     removeHighlight,
//   } = useHighlightHandler(contentRef, getPosition);

//   return (
//     <div className="space-y-2">
//       {/* <RichTextContent content={question.text || ""} className="text-sm" /> */}
//       <RichTextEditor
//         value={question.text || ""}
//         onChange={(content) => onQuestionHighlighted(question.id, content)}
//         readonly={true}
//         className={cn(
//           "leading-relaxed w-full h-full",
//         )}
//         minHeight={20}
//       />
//       <RadioGroup
//         value={value}
//         unselectable="on"
//         onValueChange={(value) => {
//           if (!readOnly) {
//             onChange(value, question.id);
//           }
//         }}
//       >
//         <div className="space-y-1">
//           {question.options.map((option) => {
//             const isCorrect = showCorrectAnswer && option.isCorrect;
//             const isSelectedAndIncorrect =
//               showCorrectAnswer && value === option.id && !option.isCorrect;
//             const isSelected = value === option.id;

//             return (
//               <div
//                 key={option.id}
//                 className={cn(
//                   "relative flex items-center space-x-2 px-2 py-1.5 rounded  text-sm",
//                   isSelected && "border-primary",
//                   !isSelected && "border-input",
//                   isCorrect &&
//                     showCorrectAnswer &&
//                     "border-green-500 bg-green-50",
//                   isSelectedAndIncorrect && "border-red-500 bg-red-50",
//                   !readOnly && "hover:bg-muted",
//                 )}
//               >
//                 <RadioGroupItem
//                   value={option.id}
//                   id={`option-${option.id}`}
//                   disabled={readOnly}
//                   className={cn(
//                     "h-4 w-4",
//                     isCorrect && showCorrectAnswer && "text-green-600",
//                     isSelectedAndIncorrect && "text-red-600",
//                   )}
//                 />
//                 <Label
//                   htmlFor={`option-${option.id}`}
//                   className="flex-grow cursor-pointer py-0.5"
//                 >
//                   {option.text}
//                 </Label>
//               </div>
//             );
//           })}
//         </div>
//       </RadioGroup>
//     </div>
//   );
// }


"use client";
import React, { useRef } from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import { Label } from "@testComponents/components/ui/label";
import type { MultipleChoiceQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
<<<<<<< HEAD
import { useHighlightHandler } from "@testComponents/hooks/use-highlight";
import { getPosition } from "@testComponents/lib/get-position";
import { HighlightPopup } from "@testComponents/components/ui/highlight-popup";
=======
>>>>>>> bd24419d182ac0d6c4a1002a1c036f1ff5a59267

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestion;
  value?: string;
  onChange: (value: string, subId: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
}

export default function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
<<<<<<< HEAD
  onQuestionHighlighted = () => { },
=======
  onQuestionHighlighted = () => {},
>>>>>>> bd24419d182ac0d6c4a1002a1c036f1ff5a59267
}: MultipleChoiceQuestionProps) {
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    popover,
    applyHighlight,
    removeHighlight,
  } = useHighlightHandler(
    { current: Object.values(contentRefs.current).find(Boolean) || null },
    getPosition
  );

  return (
    <div className="space-y-2">
<<<<<<< HEAD
=======
      {/* <RichTextContent content={question.text || ""} className="text-sm" /> */}
>>>>>>> bd24419d182ac0d6c4a1002a1c036f1ff5a59267
      <RichTextEditor
        value={question.text || ""}
        onChange={(content) => onQuestionHighlighted(question.id, content)}
        readonly={true}
<<<<<<< HEAD
        className={cn("leading-relaxed w-full h-full")}
        minHeight={20}
      />

=======
        className={cn(
          "leading-relaxed w-full h-full",
        )}
        minHeight={20}
      />
>>>>>>> bd24419d182ac0d6c4a1002a1c036f1ff5a59267
      <RadioGroup
        value={value}
        unselectable="on"
        onValueChange={(value) => {
          if (!readOnly) {
            onChange(value, question.id);
          }
        }}
      >
        <div className="space-y-1">
          {question.options.map((option) => {
            const isCorrect = showCorrectAnswer && option.isCorrect;
            const isSelectedAndIncorrect =
              showCorrectAnswer && value === option.id && !option.isCorrect;
            const isSelected = value === option.id;

            return (
              <div
                key={option.id}
                className={cn(
                  "relative flex items-center space-x-2 px-2 py-1.5 rounded text-sm",
                  isSelected && "border-primary",
                  !isSelected && "border-input",
                  isCorrect && "border-green-500 bg-green-50",
                  isSelectedAndIncorrect && "border-red-500 bg-red-50",
                  !readOnly && "hover:bg-muted"
                )}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`option-${option.id}`}
                  disabled={readOnly}
                  className={cn(
                    "h-4 w-4",
                    isCorrect && "text-green-600",
                    isSelectedAndIncorrect && "text-red-600"
                  )}
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="flex-grow cursor-pointer py-0.5"
                >
                  <div
                    ref={(el) => {
                      if (el) {
                        contentRefs.current[option.id] = el;
                      } else {
                        delete contentRefs.current[option.id];
                      }
                    }}
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: option.text }}
                  />
                </Label>

              </div>
            );
          })}
        </div>
      </RadioGroup>

      {popover && (
        <HighlightPopup
          top={popover.top}
          left={popover.left}
          onSelectColor={applyHighlight}
          onRemoveHighlight={removeHighlight}
        />
      )}

      <style>{`
        mark.custom-highlight {
          background-color: #FEF08A;
          padding: 0;
          margin: 0;
          font-weight: inherit;
          border-radius: 2px;
        }
        .rich-text-content {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
        }
      `}</style>
    </div>
  );
}
