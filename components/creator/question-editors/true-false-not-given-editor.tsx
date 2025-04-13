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
import type { TrueFalseNotGivenQuestion } from "@/lib/types";
import { List, PlusCircle, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface TrueFalseNotGivenEditorProps {
  question: TrueFalseNotGivenQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<TrueFalseNotGivenQuestion>
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

  const handleAnswerChange = (
    index: number,
    value: "true" | "false" | "not-given"
  ) => {
    const updatedSubQuestions = [...(question.subQuestions || [])];
    updatedSubQuestions[index] = {
      subId: generateSubId(),
      item: question.statements[index].id,
      correctAnswer: value,
      points: 1,
    };
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
            <div key={statement.id} className="flex gap-1.5 items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                {index + 1}
              </div>
              <Input
                value={statement.text}
                onChange={(e) => handleStatementChange(index, e.target.value)}
                placeholder={`Statement ${index + 1}`}
                className="h-7 text-sm"
              />
              <Select
                value={question.subQuestions?.[index]?.correctAnswer || "true"}
                onValueChange={(value) =>
                  handleAnswerChange(
                    index,
                    value as "true" | "false" | "not-given"
                  )
                }
              >
                <SelectTrigger className="w-24 h-7 text-xs">
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
    </div>
  );
}
