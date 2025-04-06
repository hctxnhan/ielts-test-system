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
import { PlusCircle } from "lucide-react";
import type { TrueFalseNotGivenQuestion } from "@/lib/types";

interface TrueFalseNotGivenEditorProps {
  question: TrueFalseNotGivenQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function TrueFalseNotGivenEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: TrueFalseNotGivenEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Statements
        </Label>
        <div className="space-y-1">
          {question.statements?.map((statement, stmtIndex) => (
            <div key={stmtIndex} className="flex gap-1.5 items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                {stmtIndex + 1}
              </div>
              <Input
                value={statement}
                onChange={(e) => {
                  const newStatements = [...(question.statements || [])];
                  newStatements[stmtIndex] = e.target.value;
                  onUpdateQuestion(sectionId, question.id, {
                    statements: newStatements,
                  });
                }}
                placeholder={`Statement ${stmtIndex + 1}`}
                className="h-7 text-sm"
              />
              <Select
                value={question.correctAnswers?.[stmtIndex] || "true"}
                onValueChange={(value) => {
                  const newAnswers = [...(question.correctAnswers || [])];
                  newAnswers[stmtIndex] = value as
                    | "true"
                    | "false"
                    | "not-given";
                  onUpdateQuestion(sectionId, question.id, {
                    correctAnswers: newAnswers,
                  });
                }}
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
                onClick={() => {
                  const newStatements = question.statements.filter(
                    (_, i) => i !== stmtIndex
                  );
                  const newCorrectAnswers = [
                    ...(question.correctAnswers || []),
                  ];
                  newCorrectAnswers.splice(stmtIndex, 1);
                  onUpdateQuestion(sectionId, question.id, {
                    statements: newStatements,
                    correctAnswers: newCorrectAnswers,
                  });
                }}
                disabled={question.statements.length <= 1}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newStatements = [...(question.statements || []), ""];
            const newCorrectAnswers = [
              ...(question.correctAnswers || []),
              "true",
            ];
            onUpdateQuestion(sectionId, question.id, {
              statements: newStatements,
              correctAnswers: newCorrectAnswers,
            });
          }}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
        >
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Add Statement
        </Button>
      </div>
    </div>
  );
}
