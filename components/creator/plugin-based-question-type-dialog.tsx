"use client";
import React from "react";
import { Button } from "@testComponents/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@testComponents/components/ui/dialog";
import type { TestType, QuestionType } from "@testComponents/lib/types";
import { Badge } from "@testComponents/components/ui/badge";
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";

interface PluginBasedQuestionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testType: TestType;
  onSelectQuestionType: (type: QuestionType) => void;
}

export default function PluginBasedQuestionTypeDialog({
  open,
  onOpenChange,
  testType,
  onSelectQuestionType,
}: PluginBasedQuestionTypeDialogProps) {
  // Get plugins for the current test type
  const availablePlugins = QuestionPluginRegistry.getPluginsByCategory(testType);

  const handleSelectType = (type: QuestionType) => {
    onSelectQuestionType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Question Type</DialogTitle>
          <DialogDescription>
            Choose the type of question you want to add to this {testType} test section.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {availablePlugins.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                No question types available for {testType} tests.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please register question plugins for this test type.
              </p>
            </div>
          )}
          
          {availablePlugins.map((plugin) => (
            <Button
              key={plugin.config.type}
              variant="outline"
              className="p-4 h-auto text-left flex flex-col items-start space-y-2 hover:bg-accent"
              onClick={() => handleSelectType(plugin.config.type)}
            >
              <div className="flex items-center space-x-2 w-full">
                <span className="text-lg">{plugin.config.icon}</span>
                <span className="font-medium">{plugin.config.displayName}</span>
                <div className="ml-auto flex flex-wrap gap-1">
                  {plugin.config.supportsPartialScoring && (
                    <Badge variant="secondary" className="text-xs">
                      Partial
                    </Badge>
                  )}
                  {plugin.config.supportsAIScoring && (
                    <Badge variant="secondary" className="text-xs">
                      AI
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {plugin.config.description}
              </p>
            </Button>
          ))}
        </div>

        {availablePlugins.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Plugin System:</strong> Question types are now managed through plugins. 
              This makes it easier to add new question types and maintain existing ones.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
