// "use client";
// import React from "react";
// import { Button } from "@testComponents/components/ui/button";
// import { Input } from "@testComponents/components/ui/input";
// import { Label } from "@testComponents/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@testComponents/components/ui/select";
// import type {
//   MatchingHeadingsQuestion,
//   SubQuestionMeta,
// } from "@testComponents/lib/types";
// import {
//   List,
//   Globe,
//   CheckCircle,
//   X,
//   ArrowRight,
//   PlusCircle,
// } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";

// interface MatchingHeadingsEditorProps {
//   question: MatchingHeadingsQuestion;
//   sectionId: string;
//   onUpdateQuestion: (
//     sectionId: string,
//     questionId: string,
//     updates: Partial<MatchingHeadingsQuestion>,
//   ) => void;
// }

// const MatchingHeadingsEditor = ({
//   question,
//   sectionId,
//   onUpdateQuestion,
// }: MatchingHeadingsEditorProps) => {
//   const handleParagraphChange = (paragraphId: string, text: string) => {
//     const newParagraphs = [...(question.paragraphs || [])];
//     const paragraphIndex = newParagraphs.findIndex((p) => p.id === paragraphId);
//     if (paragraphIndex !== -1) {
//       newParagraphs[paragraphIndex] = {
//         ...newParagraphs[paragraphIndex],
//         text,
//       };
//       onUpdateQuestion(sectionId, question.id, { paragraphs: newParagraphs });
//     }
//   };

//   const handleParagraphRemove = (paragraphId: string) => {
//     const newParagraphs = question.paragraphs.filter(
//       (p) => p.id !== paragraphId,
//     );
//     const newSubQuestions = (question.subQuestions || []).filter(
//       (sq) => sq.item !== paragraphId,
//     );
//     onUpdateQuestion(sectionId, question.id, {
//       paragraphs: newParagraphs,
//       subQuestions: newSubQuestions,
//     });
//   };

//   const handleAddParagraph = () => {
//     const newParagraphs = [
//       ...(question.paragraphs || []),
//       { id: uuidv4(), text: "" },
//     ];
//     const newIndex = (question.paragraphs || []).length;
//     const newSubQuestions = [
//       ...(question.subQuestions || []),
//       {
//         subIndex: newIndex,
//         subId: uuidv4(),
//         item: newParagraphs[newIndex].id,
//         correctAnswer: "", // Initialize with empty string instead of 0
//         points: 1,
//       },
//     ];
//     onUpdateQuestion(sectionId, question.id, {
//       paragraphs: newParagraphs,
//       subQuestions: newSubQuestions,
//     });
//   };

//   const handleHeadingChange = (headingId: string, text: string) => {
//     const newHeadings = [...(question.headings || [])];
//     const headingIndex = newHeadings.findIndex((h) => h.id === headingId);
//     if (headingIndex !== -1) {
//       newHeadings[headingIndex] = { ...newHeadings[headingIndex], text };
//       onUpdateQuestion(sectionId, question.id, { headings: newHeadings });
//     }
//   };

//   const handleHeadingRemove = (headingId: string) => {
//     const newHeadings = question.headings.filter((h) => h.id !== headingId);
//     // Also remove any subquestions that were using this heading as an answer
//     const newSubQuestions = (question.subQuestions || []).map((sq) => ({
//       ...sq,
//       correctAnswer: sq.correctAnswer === headingId ? "" : sq.correctAnswer,
//     }));
//     onUpdateQuestion(sectionId, question.id, {
//       headings: newHeadings,
//       subQuestions: newSubQuestions,
//     });
//   };

//   const handleAddHeading = () => {
//     const newHeadings = [
//       ...(question.headings || []),
//       { id: uuidv4(), text: "" },
//     ];
//     onUpdateQuestion(sectionId, question.id, { headings: newHeadings });
//   };

//   const handleCorrectMatchChange = (paraId: string, headingId: string) => {
//     const newSubQuestions = [...(question.subQuestions || [])];
//     const existingSubQuestion = newSubQuestions.find(
//       (sq) => sq.item === paraId,
//     );
//     if (!existingSubQuestion) {
//       newSubQuestions.push({
//         subId: uuidv4(),
//         item: paraId,
//         correctAnswer: headingId,
//         points: 1,
//         subIndex: newSubQuestions.length, // Keep this for backward compatibility
//       });
//     } else {
//       existingSubQuestion.correctAnswer = headingId;
//     }
//     onUpdateQuestion(sectionId, question.id, { subQuestions: newSubQuestions });
//   };

//   return (
//     <div className="space-y-3">
//       <div className="grid grid-cols-2 gap-3">
//         <ParagraphsSection
//           paragraphs={question.paragraphs || []}
//           onParagraphChange={handleParagraphChange}
//           onParagraphRemove={handleParagraphRemove}
//           onAddParagraph={handleAddParagraph}
//         />
//         <HeadingsSection
//           headings={question.headings || []}
//           onHeadingChange={handleHeadingChange}
//           onHeadingRemove={handleHeadingRemove}
//           onAddHeading={handleAddHeading}
//         />
//       </div>
//       <CorrectMatchesSection
//         paragraphs={question.paragraphs || []}
//         headings={question.headings || []}
//         subQuestions={question.subQuestions || []}
//         onCorrectMatchChange={handleCorrectMatchChange}
//       />
//     </div>
//   );
// };

// const ParagraphsSection = ({
//   paragraphs,
//   onParagraphChange,
//   onParagraphRemove,
//   onAddParagraph,
// }: {
//   paragraphs: { id: string; text: string }[];
//   onParagraphChange: (paraId: string, text: string) => void;
//   onParagraphRemove: (paraId: string) => void;
//   onAddParagraph: () => void;
// }) => (
//   <div className="space-y-1.5">
//     <Label className="text-xs font-medium flex items-center gap-1.5">
//       <List className="w-3 h-3" />
//       Paragraphs
//     </Label>
//     <div className="space-y-1">
//       {paragraphs.map((paragraph, index) => (
//         <div key={paragraph.id} className="flex gap-1.5 items-center">
//           <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
//             {index + 1}
//           </div>
//           <Input
//             value={paragraph.text}
//             onChange={(e) => onParagraphChange(paragraph.id, e.target.value)}
//             placeholder={`Paragraph ${index + 1}`}
//             className="h-7 text-sm"
//           />
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => onParagraphRemove(paragraph.id)}
//             disabled={paragraphs.length <= 1}
//             className="h-6 w-6 text-muted-foreground hover:text-destructive"
//           >
//             <X className="w-3.5 h-3.5" />
//           </Button>
//         </div>
//       ))}
//     </div>
//     <Button
//       variant="ghost"
//       size="sm"
//       onClick={onAddParagraph}
//       className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
//     >
//       <PlusCircle className="mr-1 h-3.5 w-3.5" />
//       Add Paragraph
//     </Button>
//   </div>
// );

// const HeadingsSection = ({
//   headings,
//   onHeadingChange,
//   onHeadingRemove,
//   onAddHeading,
// }: {
//   headings: { id: string; text: string }[];
//   onHeadingChange: (headingId: string, text: string) => void;
//   onHeadingRemove: (headingId: string) => void;
//   onAddHeading: () => void;
// }) => (
//   <div className="space-y-1.5">
//     <Label className="text-xs font-medium flex items-center gap-1.5">
//       <Globe className="w-3 h-3" />
//       Headings
//     </Label>
//     <div className="space-y-1">
//       {headings.map((heading, index) => (
//         <div key={heading.id} className="flex gap-1.5 items-center">
//           <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
//             {String.fromCharCode(65 + index)}
//           </div>
//           <Input
//             value={heading.text}
//             onChange={(e) => onHeadingChange(heading.id, e.target.value)}
//             placeholder={`Heading ${String.fromCharCode(65 + index)}`}
//             className="h-7 text-sm"
//           />
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => onHeadingRemove(heading.id)}
//             disabled={headings.length <= 1}
//             className="h-6 w-6 text-muted-foreground hover:text-destructive"
//           >
//             <X className="w-3.5 h-3.5" />
//           </Button>
//         </div>
//       ))}
//     </div>
//     <Button
//       variant="ghost"
//       size="sm"
//       onClick={onAddHeading}
//       className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
//     >
//       <PlusCircle className="mr-1 h-3.5 w-3.5" />
//       Add Heading
//     </Button>
//   </div>
// );

// const CorrectMatchesSection = ({
//   paragraphs,
//   headings,
//   subQuestions,
//   onCorrectMatchChange,
// }: {
//   paragraphs: { id: string; text: string }[];
//   headings: { id: string; text: string }[];
//   subQuestions: SubQuestionMeta[];
//   onCorrectMatchChange: (paraId: string, value: string) => void;
// }) => (
//   <div className="space-y-1.5">
//     <Label className="text-xs font-medium flex items-center gap-1.5">
//       <CheckCircle className="w-3 h-3" />
//       Correct Matches
//     </Label>
//     <div className="space-y-1 bg-muted/20 p-2 rounded-md">
//       {paragraphs.map((paragraph, paraIndex) => {
//         const paragraphNumber = paraIndex + 1;
//         return (
//           <div key={paragraph.id} className="flex items-center gap-1.5 text-sm">
//             <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
//               {paragraphNumber}
//             </div>
//             <span className="w-1/3 text-xs truncate">
//               {paragraph.text || `Paragraph ${paragraphNumber}`}
//             </span>
//             <ArrowRight className="w-3 h-3 shrink-0" />
//             <Select
//               value={
//                 subQuestions.find((sq) => sq.item === paragraph.id)
//                   ?.correctAnswer || ""
//               }
//               onValueChange={(value) =>
//                 onCorrectMatchChange(paragraph.id, value)
//               }
//             >
//               <SelectTrigger className="flex-1 h-7 text-xs">
//                 <SelectValue placeholder="Select matching heading" />
//               </SelectTrigger>
//               <SelectContent>
//                 {headings.map((heading, headingIndex) => {
//                   const headingLetter = String.fromCharCode(65 + headingIndex);
//                   return (
//                     <SelectItem
//                       key={heading.id}
//                       value={heading.id}
//                       className="text-sm py-1.5 px-2"
//                     >
//                       <div className="flex items-center gap-1.5">
//                         <div className="flex items-center justify-center h-4 w-4 rounded-full bg-muted/50 text-xs font-medium">
//                           {headingLetter}
//                         </div>
//                         <span>
//                           {heading.text || `Heading ${headingLetter}`}
//                         </span>
//                       </div>
//                     </SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           </div>
//         );
//       })}
//     </div>
//   </div>
// );

// export default MatchingHeadingsEditor;
"use client";
import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@testComponents/components/ui/select";
import type {
  MatchingHeadingsQuestion,
  SubQuestionMeta,
} from "@testComponents/lib/types";
import {
  List,
  Globe,
  CheckCircle,
  X,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";

interface MatchingHeadingsEditorProps {
  question: MatchingHeadingsQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<MatchingHeadingsQuestion>,
  ) => void;
}

const MatchingHeadingsEditor = ({
  question,
  sectionId,
  onUpdateQuestion,
}: MatchingHeadingsEditorProps) => {
  /**
   * Ensure subQuestions exists for every paragraph and preserves existing data.
   * This prevents mismatch between paragraphs and explanations.
   */
  const ensureSubQuestionsForParagraphs = React.useCallback(() => {
    const paragraphs = question.paragraphs || [];
    const existingSubs = question.subQuestions || [];
    // Build desired subQuestions array (one per paragraph) preserving existing ones
    const desiredSubs: SubQuestionMeta[] = paragraphs.map((p, idx) => {
      const found = existingSubs.find((sq) => sq.item === p.id);
      if (found) {
        // keep existing sub question, but ensure fields exist
        return {
          subId: found.subId || uuidv4(),
          item: found.item || p.id,
          subIndex: found.subIndex ?? idx + 1,
          correctAnswer: found.correctAnswer ?? "",
          points: found.points ?? 1,
          explanation: found.explanation ?? "",
        };
      }
      // create new subQuestion for this paragraph
      return {
        subId: uuidv4(),
        item: p.id,
        subIndex: idx + 1,
        correctAnswer: "",
        points: 1,
        explanation: "",
      };
    });

    // compare shallowly to avoid unnecessary updates
    const equal =
      desiredSubs.length === existingSubs.length &&
      desiredSubs.every((d, i) => d.item === existingSubs[i]?.item);

    if (!equal) {
      onUpdateQuestion(sectionId, question.id, { subQuestions: desiredSubs });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.paragraphs?.length, question.subQuestions?.length, question.id, sectionId]);

  React.useEffect(() => {
    ensureSubQuestionsForParagraphs();
  }, [ensureSubQuestionsForParagraphs]);

  const handleParagraphChange = (paragraphId: string, text: string) => {
    const newParagraphs = [...(question.paragraphs || [])];
    const paragraphIndex = newParagraphs.findIndex((p) => p.id === paragraphId);
    if (paragraphIndex !== -1) {
      newParagraphs[paragraphIndex] = {
        ...newParagraphs[paragraphIndex],
        text,
      };
      onUpdateQuestion(sectionId, question.id, { paragraphs: newParagraphs });
    }
  };

  const handleParagraphRemove = (paragraphId: string) => {
    const newParagraphs = (question.paragraphs || []).filter(
      (p) => p.id !== paragraphId,
    );
    const newSubQuestions = (question.subQuestions || []).filter(
      (sq) => sq.item !== paragraphId,
    );
    onUpdateQuestion(sectionId, question.id, {
      paragraphs: newParagraphs,
      subQuestions: newSubQuestions,
    });
  };

  const handleAddParagraph = () => {
    // keep behavior consistent but include explanation field for the new subQuestion
    const newParagraphs = [
      ...(question.paragraphs || []),
      { id: uuidv4(), text: "" },
    ];
    const newIndex = (question.paragraphs || []).length;
    const newSubQuestions = [
      ...(question.subQuestions || []).map((sq) => ({ ...sq })), // preserve existing
      {
        subIndex: newIndex + 1,
        subId: uuidv4(),
        item: newParagraphs[newIndex].id,
        correctAnswer: "", // Initialize with empty string
        points: 1,
        explanation: "",
      },
    ];
    onUpdateQuestion(sectionId, question.id, {
      paragraphs: newParagraphs,
      subQuestions: newSubQuestions,
    });
  };

  const handleHeadingChange = (headingId: string, text: string) => {
    const newHeadings = [...(question.headings || [])];
    const headingIndex = newHeadings.findIndex((h) => h.id === headingId);
    if (headingIndex !== -1) {
      newHeadings[headingIndex] = { ...newHeadings[headingIndex], text };
      onUpdateQuestion(sectionId, question.id, { headings: newHeadings });
    }
  };

  const handleHeadingRemove = (headingId: string) => {
    const newHeadings = (question.headings || []).filter((h) => h.id !== headingId);
    // Also remove any subquestions that were using this heading as an answer
    const newSubQuestions = (question.subQuestions || []).map((sq) => ({
      ...sq,
      correctAnswer: sq.correctAnswer === headingId ? "" : sq.correctAnswer,
    }));
    onUpdateQuestion(sectionId, question.id, {
      headings: newHeadings,
      subQuestions: newSubQuestions,
    });
  };

  const handleAddHeading = () => {
    const newHeadings = [
      ...(question.headings || []),
      { id: uuidv4(), text: "" },
    ];
    onUpdateQuestion(sectionId, question.id, { headings: newHeadings });
  };

  const handleCorrectMatchChange = (paraId: string, headingId: string) => {
    const newSubQuestions = [...(question.subQuestions || [])];
    const existingSubQuestion = newSubQuestions.find((sq) => sq.item === paraId);
    if (!existingSubQuestion) {
      newSubQuestions.push({
        subId: uuidv4(),
        item: paraId,
        correctAnswer: headingId,
        points: 1,
        subIndex: newSubQuestions.length + 1, // keep 1-based index
        explanation: "",
      });
    } else {
      existingSubQuestion.correctAnswer = headingId;
    }
    onUpdateQuestion(sectionId, question.id, { subQuestions: newSubQuestions });
  };

  /** Update explanation for a given subId, create subQuestion when missing */
  const handleExplanationChange = (paraId: string, content: string) => {
    // find corresponding subQuestion by paragraph id (item)
    const existingSubs = [...(question.subQuestions || [])];
    const idx = existingSubs.findIndex((sq) => sq.item === paraId);

    if (idx >= 0) {
      existingSubs[idx] = { ...existingSubs[idx], explanation: content };
    } else {
      // create a subQuestion (shouldn't be common because ensureSubQuestions runs)
      existingSubs.push({
        subId: uuidv4(),
        item: paraId,
        subIndex: existingSubs.length + 1,
        correctAnswer: "",
        points: 1,
        explanation: content,
      });
    }

    onUpdateQuestion(sectionId, question.id, { subQuestions: existingSubs });
  };

  // Render
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ParagraphsSection
          paragraphs={question.paragraphs || []}
          onParagraphChange={handleParagraphChange}
          onParagraphRemove={handleParagraphRemove}
          onAddParagraph={handleAddParagraph}
        />
        <HeadingsSection
          headings={question.headings || []}
          onHeadingChange={handleHeadingChange}
          onHeadingRemove={handleHeadingRemove}
          onAddHeading={handleAddHeading}
        />
      </div>
      <CorrectMatchesSection
        paragraphs={question.paragraphs || []}
        headings={question.headings || []}
        subQuestions={question.subQuestions || []}
        onCorrectMatchChange={handleCorrectMatchChange}
      />

      {/* Explanations section: render one editor per paragraph (keeps count consistent) */}
      <div className="space-y-3 pt-4">
        <Label className="text-xs font-medium">Explanation for Each Paragraph</Label>
        {(question.paragraphs || []).map((paragraph, idx) => {
          const sub = (question.subQuestions || []).find((sq) => sq.item === paragraph.id);
          const explanationValue = sub?.explanation ?? "";

          return (
            <div key={paragraph.id} className="p-2 rounded-md border bg-muted/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-muted/50">
                  {idx + 1}
                </div>
                Explanation for Paragraph {idx + 1}
              </div>

              <RichTextEditor
                id={`subq-expl-${paragraph.id}`}
                value={explanationValue}
                onChange={(content) => handleExplanationChange(paragraph.id, content)}
                placeholder="Add explanation"
                minHeight={120}
                maxHeight={200}
                className="text-sm"
                enableHighlight={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ParagraphsSection = ({
  paragraphs,
  onParagraphChange,
  onParagraphRemove,
  onAddParagraph,
}: {
  paragraphs: { id: string; text: string }[];
  onParagraphChange: (paraId: string, text: string) => void;
  onParagraphRemove: (paraId: string) => void;
  onAddParagraph: () => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium flex items-center gap-1.5">
      <List className="w-3 h-3" />
      Paragraphs
    </Label>
    <div className="space-y-1">
      {paragraphs.map((paragraph, index) => (
        <div key={paragraph.id} className="flex gap-1.5 items-center">
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
            {index + 1}
          </div>
          <Input
            value={paragraph.text}
            onChange={(e) => onParagraphChange(paragraph.id, e.target.value)}
            placeholder={`Paragraph ${index + 1}`}
            className="h-7 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onParagraphRemove(paragraph.id)}
            disabled={paragraphs.length <= 1}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onAddParagraph}
      className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
    >
      <PlusCircle className="mr-1 h-3.5 w-3.5" />
      Add Paragraph
    </Button>
  </div>
);

const HeadingsSection = ({
  headings,
  onHeadingChange,
  onHeadingRemove,
  onAddHeading,
}: {
  headings: { id: string; text: string }[];
  onHeadingChange: (headingId: string, text: string) => void;
  onHeadingRemove: (headingId: string) => void;
  onAddHeading: () => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium flex items-center gap-1.5">
      <Globe className="w-3 h-3" />
      Headings
    </Label>
    <div className="space-y-1">
      {headings.map((heading, index) => (
        <div key={heading.id} className="flex gap-1.5 items-center">
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
            {String.fromCharCode(65 + index)}
          </div>
          <Input
            value={heading.text}
            onChange={(e) => onHeadingChange(heading.id, e.target.value)}
            placeholder={`Heading ${String.fromCharCode(65 + index)}`}
            className="h-7 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onHeadingRemove(heading.id)}
            disabled={headings.length <= 1}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onAddHeading}
      className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
    >
      <PlusCircle className="mr-1 h-3.5 w-3.5" />
      Add Heading
    </Button>
  </div>
);

const CorrectMatchesSection = ({
  paragraphs,
  headings,
  subQuestions,
  onCorrectMatchChange,
}: {
  paragraphs: { id: string; text: string }[];
  headings: { id: string; text: string }[];
  subQuestions: SubQuestionMeta[];
  onCorrectMatchChange: (paraId: string, value: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium flex items-center gap-1.5">
      <CheckCircle className="w-3 h-3" />
      Correct Matches
    </Label>
    <div className="space-y-1 bg-muted/20 p-2 rounded-md">
      {paragraphs.map((paragraph, paraIndex) => {
        const paragraphNumber = paraIndex + 1;
        return (
          <div key={paragraph.id} className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
              {paragraphNumber}
            </div>
            <span className="w-1/3 text-xs truncate">
              {paragraph.text || `Paragraph ${paragraphNumber}`}
            </span>
            <ArrowRight className="w-3 h-3 shrink-0" />
            <Select
              value={
                subQuestions.find((sq) => sq.item === paragraph.id)
                  ?.correctAnswer || ""
              }
              onValueChange={(value) =>
                onCorrectMatchChange(paragraph.id, value)
              }
            >
              <SelectTrigger className="flex-1 h-7 text-xs">
                <SelectValue placeholder="Select matching heading" />
              </SelectTrigger>
              <SelectContent>
                {headings.map((heading, headingIndex) => {
                  const headingLetter = String.fromCharCode(65 + headingIndex);
                  return (
                    <SelectItem
                      key={heading.id}
                      value={heading.id}
                      className="text-sm py-1.5 px-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center h-4 w-4 rounded-full bg-muted/50 text-xs font-medium">
                          {headingLetter}
                        </div>
                        <span>
                          {heading.text || `Heading ${headingLetter}`}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  </div>
);

export default MatchingHeadingsEditor;




