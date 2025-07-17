"use client";
import React, { useEffect, useRef, useState } from "react";
import parse, { Element, Text, domToReact } from "html-react-parser";
import styleToObject from "style-to-object";
import { Input } from "@testComponents/components/ui/input";
import type { CompletionQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { HighlightPopup } from "@testComponents/components/ui/highlight-popup";
import { useHighlightHandler } from "@testComponents/hooks/use-highlight"
import { getPosition } from "@testComponents/lib/get-position";

interface CompletionQuestionProps {
 question: CompletionQuestion;
 value: Record<string, string> | null;
 onChange: (value: Record<string, string>, subQuestionId?: string) => void;
 readOnly?: boolean;
 showCorrectAnswer?: boolean;
 onQuestionHighlighted?: (questionId: string, content: string) => void;
}

export default function CompletionQuestionRenderer({
 question,
 value,
 onChange,
 readOnly = false,
 showCorrectAnswer = false,
 onQuestionHighlighted = () => { },
}: CompletionQuestionProps) {
console.log("==> question", question)
 const contentRef = useRef<HTMLDivElement>(null);
 const { popover, applyHighlight, removeHighlight } = useHighlightHandler(contentRef, getPosition);
 const parseHtmlWithInputs = React.useCallback((htmlContent: string) => {
   let blankCounter = 0;
   const replaceNode = (domNode: any): any => {
     if (domNode.type === "text") {
       const text = domNode.data;

       // Find sequences of 3 or more underscores
       const underscoreRegex = /_{3,}/g;
       const parts = text.split(underscoreRegex);
       const matches = text.match(underscoreRegex);


       if (!matches) {
         return undefined; // Return original node
       }

       const result: (string | React.ReactElement)[] = [];
       for (let i = 0; i < parts.length; i++) {
         if (parts[i]) {
           result.push(parts[i]);
         }
         if (i < matches.length) {
           const currentSubQuestion = question.subQuestions[blankCounter];
           const currentSubQuestionIndex = question.index + blankCounter;


           if (currentSubQuestion) {
             const userAnswer = value?.[currentSubQuestion.subId] || "";
             const normalizedUserAnswer = userAnswer
               .trim()
               .toLowerCase()
               .replace(/\s+/g, " ");
             const isCorrect =
               showCorrectAnswer &&
               currentSubQuestion.acceptableAnswers?.some(
                 (answer) =>
                   answer.trim().toLowerCase().replace(/\s+/g, " ") ===
                   normalizedUserAnswer,
               );
             const isIncorrect = showCorrectAnswer && !isCorrect;

             result.push(
               <span key={`blank-${currentSubQuestion.subId}-${blankCounter}`} className="inline-flex items-center gap-2">
                 <div className="flex items-center gap-1">
                   <div className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                     {currentSubQuestionIndex + 1}
                   </div>
                   <Input
                     id={`blank-${currentSubQuestion.subId}`}
                     value={userAnswer}
                     onChange={(e) => {
                       if (!readOnly) {
                         const newAnswers = { ...(value || {}) };
                         newAnswers[currentSubQuestion.subId] = e.target.value;
                         if (question.scoringStrategy === "partial") {
                           onChange(newAnswers, currentSubQuestion.subId);
                         } else {
                           onChange(newAnswers);
                         }
                       }
                     }}
                     readOnly={readOnly}
                     placeholder={readOnly ? "Not answered" : "Your answer"}
                     style={{
                       width: `${Math.max(70, Math.min(200, (userAnswer.length || 10) * 8 + 16))}px`
                     }}
                     className={cn(
                       "inline-block h-8 text-xs mx-1 text-center border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 focus:outline-none px-0.5 py-0 placeholder:text-xs",
                       isCorrect && "border-b-green-500 bg-green-50",
                       isIncorrect && "border-b-red-500 bg-red-50",
                     )}
                   />
                 </div>
                 {isIncorrect && showCorrectAnswer && (
                   <span className="text-green-600 text-sm whitespace-nowrap mr-2">
                     ✓ {currentSubQuestion.acceptableAnswers?.[0] || ""}
                     {currentSubQuestion.acceptableAnswers &&
                       currentSubQuestion.acceptableAnswers.length > 1 && (
                         <span className="text-gray-500 ml-1">
                           (or:{" "}
                           {currentSubQuestion.acceptableAnswers.slice(1).join(", ")})
                         </span>
                       )}
                   </span>
                 )}
               </span>
             );
           }
           blankCounter++;
         }
       }


       return <>{result}</>;
     }


     // Handle elements with style attributes
     if (domNode.type === "tag") {
       const { name, attribs, children } = domNode;
       let style: React.CSSProperties | undefined;
       if (attribs?.style) {
         try {
           style = styleToObject(attribs.style) as React.CSSProperties;
         } catch (error) {
           console.warn("Failed to parse style:", attribs.style);
         }
       }


       const props: any = {
         ...attribs,
       };


       // Apply parsed style
       if (style) {
         props.style = style;
       }


       // List of void elements that should not have children
       const voidElements = new Set([
         'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
         'link', 'meta', 'param', 'source', 'track', 'wbr'
       ]);


       // Handle void elements without children
       if (voidElements.has(name.toLowerCase())) {
         return React.createElement(name, props);
       }


       // Handle regular elements with children
       return React.createElement(
         name,
         props,
         domToReact(children as any, { replace: replaceNode })
       );
     }


     return undefined; // Return original node
   };


   return parse(htmlContent, { replace: replaceNode });
 }, [question.subQuestions, value, onChange, readOnly, showCorrectAnswer, question.scoringStrategy]);


 return (
   <div className="space-y-4">
     <div ref={contentRef} className="prose dark:prose-invert max-w-none text-sm rich-text-content relative">
       {parseHtmlWithInputs(question.text || "")}
       {popover && (
         <HighlightPopup
           top={popover.top}
           left={popover.left}
           onSelectColor={applyHighlight}
           onRemoveHighlight={removeHighlight}
         />
       )}
     </div>
     {/* Fallback: Show traditional input fields if no blanks were found in the text
     {question.subQuestions.length > 0 && !question.text?.match(/_{3,}/) && (
       <div className="space-y-2 border-t pt-4">
         <div className="text-sm text-gray-600 mb-2">Answer the following:</div>
         {question.subQuestions.map((subQuestion, index) => {
           const userAnswer = value?.[subQuestion.subId] || "";
           const normalizedUserAnswer = userAnswer
             .trim()
             .toLowerCase()
             .replace(/\s+/g, " ");
           const isCorrect =
             showCorrectAnswer &&
             subQuestion.acceptableAnswers?.some(
               (answer) =>
                 answer.trim().toLowerCase().replace(/\s+/g, " ") ===
                 normalizedUserAnswer,
             );
           const isIncorrect = showCorrectAnswer && !isCorrect;

           return (
             <div
               key={subQuestion.subId}
               className="flex gap-1.5 items-center text-sm"
             >
               <Label htmlFor={`blank-${subQuestion.subId}`} className="w-16">
                 {question.scoringStrategy === "partial"
                   ? `Q${question.index + index + 1}:`
                   : `#${index + 1}:`}
               </Label>
               <div className="relative flex gap-6">
                 <Input
                   id={`blank-${subQuestion.subId}`}
                   value={userAnswer}
                   onChange={(e) => {
                     if (!readOnly) {
                       const newAnswers = { ...(value || {}) };
                       newAnswers[subQuestion.subId] = e.target.value;
                       if (question.scoringStrategy === "partial") {
                         onChange(newAnswers, subQuestion.subId);
                       } else {
                         onChange(newAnswers);
                       }
                     }
                   }}
                   readOnly={readOnly}
                   placeholder={readOnly ? "Not answered" : "Your answer"}
                   className={cn(
                     "max-w-md pr-8 h-8 text-sm",
                     isCorrect && "border-green-500 bg-green-50",
                     isIncorrect && "border-red-500 bg-red-50",
                   )}
                 />
                 {isIncorrect && showCorrectAnswer && (
                   <div className="text-sm flex items-center">
                     <span className="text-green-600">
                       ✓ {subQuestion.acceptableAnswers?.[0] || ""}
                       {subQuestion.acceptableAnswers &&
                         subQuestion.acceptableAnswers.length > 1 && (
                           <span className="text-gray-500 ml-1">
                             (or:{" "}
                             {subQuestion.acceptableAnswers.slice(1).join(", ")})
                           </span>
                         )}
                     </span>
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </div>
     )}
      */}


     {/* Rich text content styles */}
     <style dangerouslySetInnerHTML={{
       __html: `
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
       .rich-text-content h1 {
         font-size: 2em;
         font-weight: 600;
         margin-top: 1.5em;
         margin-bottom: 0.5em;
       }
       .rich-text-content h2 {
         font-size: 1.5em;
         font-weight: 600;
         margin-top: 1.25em;
         margin-bottom: 0.5em;
       }
       .rich-text-content h3 {
         font-size: 1.25em;
         font-weight: 600;
         margin-top: 1em;
         margin-bottom: 0.5em;
       }
       .rich-text-content p {
         margin-bottom: 1em;
       }
       .rich-text-content ul, .rich-text-content ol {
         margin-bottom: 1em;
         padding-left: 1.5em;
       }
       .rich-text-content li {
         margin-bottom: 0.25em;
       }
       .rich-text-content table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 1em;
       }
       .rich-text-content th, .rich-text-content td {
         border: 1px solid #d1d5db;
         padding: 0.5em;
         text-align: left;
       }
       .rich-text-content th {
         background-color: #f9fafb;
         font-weight: 600;
       }
       .rich-text-content strong {
         font-weight: 600;
       }
       .rich-text-content em {
         font-style: italic;
       }
       .rich-text-content u {
         text-decoration: underline;
       }
       `
     }} />
   </div>
 );
}

