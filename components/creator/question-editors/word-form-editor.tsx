"use client";

import React, { useState } from "react";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import type { WordFormQuestion } from "@testComponents/lib/types";

interface WordFormEditorProps {
  value: WordFormQuestion;
  onChange: (value: WordFormQuestion) => void;
}

interface Exercise {
  id: string;
  sentence: string;
  baseWord: string;
  correctForm: string;
  position: number;
}

export default function WordFormEditor({ value, onChange }: WordFormEditorProps) {
  const [exercises, setExercises] = useState<Exercise[]>(value.exercises || []);
  const [showPreview, setShowPreview] = useState(false);

  const generateId = () => `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      sentence: "",
      baseWord: "",
      correctForm: "",
      position: exercises.length,
    };
    
    const newExercises = [...exercises, newExercise];
    setExercises(newExercises);
    updateValue(newExercises);
  };

  const removeExercise = (id: string) => {
    const newExercises = exercises.filter(ex => ex.id !== id).map((ex, index) => ({
      ...ex,
      position: index,
    }));
    setExercises(newExercises);
    updateValue(newExercises);
  };

  const updateExercise = (id: string, field: keyof Exercise, newValue: string | number) => {
    const newExercises = exercises.map(ex =>
      ex.id === id ? { ...ex, [field]: newValue } : ex
    );
    setExercises(newExercises);
    updateValue(newExercises);
  };

  const updateValue = (newExercises: Exercise[]) => {
    const updatedValue: WordFormQuestion = {
      ...value,
      exercises: newExercises,
    };
    onChange(updatedValue);
  };

  const renderPreview = () => {
    return exercises.map((exercise, index) => {
      const sentenceWithBlank = exercise.sentence.replace(/\[\[.*?\]\]|\b_+\b/, "___");
      
      return (
        <div key={exercise.id} className="border rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {index + 1}
            </div>
            <span className="text-xs font-medium">Exercise {index + 1}</span>
          </div>
          
          <div className="text-xs mb-2">
            <span>{sentenceWithBlank.split("___")[0]}</span>
            <span className="inline-flex items-center gap-2">
              <Input 
                placeholder="..." 
                className="w-32 h-6 text-xs inline-block mx-1" 
                readOnly 
              />
              <span className="text-muted-foreground text-xs">({exercise.baseWord})</span>
            </span>
            <span>{sentenceWithBlank.split("___")[1]}</span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            Correct answer: <span className="font-medium text-green-600">{exercise.correctForm}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="word-form-text" className="text-xs font-medium">
          Question Instructions
        </Label>
        <Textarea
          id="word-form-text"
          value={value.text || ""}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder="Enter the question instructions (e.g., 'Fill in the correct form of the word given in parentheses')"
          className="min-h-[60px] text-xs"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Word Form Exercises</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-1 h-3 w-3" /> Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" /> Show Preview
              </>
            )}
          </Button>
        </div>



        {/* Individual Exercise Editors */}
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <Card key={exercise.id} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                      {index + 1}
                    </div>
                    <span>Exercise {index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`sentence-${exercise.id}`} className="text-xs text-muted-foreground">Sentence</Label>
                    <Textarea
                      id={`sentence-${exercise.id}`}
                      value={exercise.sentence}
                      onChange={(e) => updateExercise(exercise.id, "sentence", e.target.value)}
                      placeholder="Enter the sentence with ___ or placeholder for the blank"
                      className="min-h-[50px] text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor={`baseWord-${exercise.id}`} className="text-xs text-muted-foreground">Base Word</Label>
                      <Input
                        id={`baseWord-${exercise.id}`}
                        value={exercise.baseWord}
                        onChange={(e) => updateExercise(exercise.id, "baseWord", e.target.value)}
                        placeholder="e.g., drive, beautiful, child"
                        className="h-7 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`correctForm-${exercise.id}`} className="text-xs text-muted-foreground">Correct Form</Label>
                      <Input
                        id={`correctForm-${exercise.id}`}
                        value={exercise.correctForm}
                        onChange={(e) => updateExercise(exercise.id, "correctForm", e.target.value)}
                        placeholder="e.g., drives, beautifully, children"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addExercise}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50"
        >
          <Plus className="mr-1.5 h-3 w-3" />
          Add Exercise
        </Button>
      </div>

      {/* Preview */}
      {showPreview && exercises.length > 0 && (
        <div className="space-y-3">
          <Label className="text-xs font-medium">Student View Preview</Label>
          <Card className="p-3">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground border-l-4 border-primary/20 pl-3 py-2">
                <strong>Instructions:</strong> Fill in the correct form of the word given in parentheses.
              </div>
              <div className="space-y-3">
                {renderPreview()}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* AI Scoring Prompt */}
      <div className="space-y-2">
        <Label htmlFor="scoring-prompt" className="text-xs font-medium">
          AI Scoring Prompt (Optional)
        </Label>
        <Textarea
          id="scoring-prompt"
          value={value.scoringPrompt || ""}
          onChange={(e) => onChange({ ...value, scoringPrompt: e.target.value })}
          placeholder="Custom AI scoring instructions for this question. Leave empty to use default prompt."
          className="min-h-[70px] text-xs"
        />
        <p className="text-xs text-muted-foreground">
          If provided, this prompt will be used by the AI to score student responses instead of the default scoring criteria.
        </p>
      </div>
    </div>
  );
}
