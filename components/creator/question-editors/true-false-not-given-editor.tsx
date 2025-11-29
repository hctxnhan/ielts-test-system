// 


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
import type { TrueFalseNotGivenQuestion } from "@testComponents/lib/types";
import { List, PlusCircle, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";

interface TrueFalseNotGivenEditorProps {
  question: TrueFalseNotGivenQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<TrueFalseNotGivenQuestion>,
  ) => void;
}

export default function TrueFalseNotGivenEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: TrueFalseNotGivenEditorProps) {

  const generateStmtId = () => uuidv4();
  const generateSubId = () => uuidv4();

  const handleStatementChange = (index: number, text: string) => {
    const updatedStatements = [...question.statements];
    updatedStatements[index] = { ...updatedStatements[index], text };
    onUpdateQuestion(sectionId, question.id, { statements: updatedStatements });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const validAnswers = ["true", "false", "not-given"];
    if (!validAnswers.includes(value)) return;

    const updatedSubQuestions = [...(question.subQuestions || [])];

    if (!updatedSubQuestions[index]) {
      updatedSubQuestions[index] = {
        subId: generateSubId(),
        item: question.statements[index].id,
        correctAnswer: value as "true" | "false" | "not-given",
        points: 1,
        explanation: "",
      };
    } else {
      updatedSubQuestions[index] = {
        ...updatedSubQuestions[index],
        correctAnswer: value as "true" | "false" | "not-given",
      };
    }

    onUpdateQuestion(sectionId, question.id, {
      subQuestions: updatedSubQuestions,
    });
  };

  const handleExplanationChange = (index: number, content: string) => {
    const updatedSubQuestions = [...(question.subQuestions || [])];
    if (!updatedSubQuestions[index]) {
      updatedSubQuestions[index] = {
        subId: generateSubId(),
        item: question.statements[index].id,
        correctAnswer: "true",
        points: 1,
        explanation: content,
      };
    } else {
      updatedSubQuestions[index].explanation = content;
    }
    onUpdateQuestion(sectionId, question.id, {
      subQuestions: updatedSubQuestions,
    });
  };

  const handleRemoveStatement = (index: number) => {
    const updatedStatements = question.statements.filter((_, i) => i !== index);
    const updatedSubQuestions =
      question.subQuestions?.filter((_, i) => i !== index) || [];
    onUpdateQuestion(sectionId, question.id, {
      statements: updatedStatements,
      subQuestions: updatedSubQuestions,
    });
  };

  const handleAddStatement = () => {
    const newStmtId = generateStmtId();
    const updatedStatements = [
      ...question.statements,
      { id: newStmtId, text: "" },
    ];
    const updatedSubQuestions = [
      ...(question.subQuestions || []),
      {
        subId: generateSubId(),
        subIndex: updatedStatements.length,
        item: newStmtId,
        correctAnswer: "true",
        points: 1,
        explanation: "",
      },
    ];
    onUpdateQuestion(sectionId, question.id, {
      statements: updatedStatements,
      subQuestions: updatedSubQuestions,
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <List className="w-3 h-3" />
          Statements
        </Label>
        <div className="space-y-1">
          {question.statements.map((statement, index) => (
            <div key={statement.id} className="space-y-1.5">
              <div className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {index + 1}
                </div>
                <Input
                  value={statement.text}
                  onChange={(e) => handleStatementChange(index, e.target.value)}
                  placeholder={`Statement ${index + 1}`}
                  className="h-7 text-sm flex-1"
                />
                <Select
                  value={question.subQuestions?.[index]?.correctAnswer || "true"}
                  onValueChange={(value) =>
                    handleAnswerChange(
                      index,
                      value as "true" | "false" | "not-given",
                    )
                  }
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue placeholder="Answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-sm py-1.5 px-2">
                      True
                    </SelectItem>
                    <SelectItem value="false" className="text-sm py-1.5 px-2">
                      False
                    </SelectItem>
                    <SelectItem value="not-given" className="text-sm py-1.5 px-2">
                      Not Given
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStatement(index)}
                  disabled={question.statements.length <= 1}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              {/* SubQuestion Explanation */}
              <div className="pl-6 pt-1">
                <Label className="text-xs font-medium">Explanation</Label>
                <RichTextEditor
                  id={`sub-question-explanation-${question.subQuestions?.[index]?.subId || uuidv4()}`}
                  value={question.subQuestions?.[index]?.explanation || ""}
                  onChange={(content) => handleExplanationChange(index, content)}
                  placeholder="Add explanation for this statement"
                  minHeight={80}
                  maxHeight={150}
                  className="text-sm"
                  enableHighlight={true}
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddStatement}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
        >
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Add Statement
        </Button>
      </div>
      {/* Optional question-level explanation */}
      {/* {question.explanation !== undefined && (
        <div className="space-y-1.5 pt-4">
          <Label className="text-xs font-medium">Question Explanation</Label>
          <RichTextEditor
            id={`question-explanation-${question.id}`}
            value={question.explanation || ""}
            onChange={(content) =>
              onUpdateQuestion(sectionId, question.id, {
                explanation: content,
              })
            }
            placeholder="Add explanation for the whole question"
            minHeight={100}
            maxHeight={200}
            className="text-sm"
            enableHighlight={false}
          />
        </div>
      )} */}
    </div>
  );
}
