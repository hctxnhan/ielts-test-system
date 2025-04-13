"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MatchingHeadingsQuestion, SubQuestionMeta } from "@/lib/types";
import {
  List,
  Globe,
  CheckCircle,
  X,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface MatchingHeadingsEditorProps {
  question: MatchingHeadingsQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<MatchingHeadingsQuestion>
  ) => void;
}

const MatchingHeadingsEditor = ({
  question,
  sectionId,
  onUpdateQuestion,
}: MatchingHeadingsEditorProps) => {
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
    const newParagraphs = question.paragraphs.filter(
      (p) => p.id !== paragraphId
    );
    const newSubQuestions = (question.subQuestions || []).filter(
      (sq) => sq.item !== paragraphId
    );
    onUpdateQuestion(sectionId, question.id, {
      paragraphs: newParagraphs,
      subQuestions: newSubQuestions,
    });
  };

  const handleAddParagraph = () => {
    const newParagraphs = [
      ...(question.paragraphs || []),
      { id: uuidv4(), text: "" },
    ];
    const newIndex = (question.paragraphs || []).length;
    const newSubQuestions = [
      ...(question.subQuestions || []),
      {
        subIndex: newIndex,
        subId: uuidv4(),
        item: newParagraphs[newIndex].id,
        correctAnswer: "", // Initialize with empty string instead of 0
        points: 1,
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
    const newHeadings = question.headings.filter((h) => h.id !== headingId);
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
    const existingSubQuestion = newSubQuestions.find(
      (sq) => sq.item === paraId
    );
    if (!existingSubQuestion) {
      newSubQuestions.push({
        subId: uuidv4(),
        item: paraId,
        correctAnswer: headingId,
        points: 1,
        subIndex: newSubQuestions.length, // Keep this for backward compatibility
      });
    } else {
      existingSubQuestion.correctAnswer = headingId;
    }
    onUpdateQuestion(sectionId, question.id, { subQuestions: newSubQuestions });
  };

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
