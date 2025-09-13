"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Trash2, Plus, Eye, EyeOff, BookOpen } from "lucide-react";
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
  const [adminSyntax, setAdminSyntax] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Initialize admin syntax from exercises
  useEffect(() => {
    if (exercises.length > 0) {
      const syntax = exercises
        .map(ex => `${ex.sentence.replace(/\[\[.*?\]\]|\b_+\b/, `[[${ex.baseWord}/${ex.correctForm}]]`)}`)
        .join("\n");
      setAdminSyntax(syntax);
    }
  }, [exercises]);

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

  const parseAdminSyntax = () => {
    const lines = adminSyntax.trim().split("\n").filter(line => line.trim());
    const newExercises: Exercise[] = [];

    lines.forEach((line, index) => {
      const regex = /\[\[([^/]+)\/([^\]]+)\]\]/g;
      const match = regex.exec(line);
      
      if (match) {
        const [fullMatch, baseWord, correctForm] = match;
        const sentence = line.replace(fullMatch, "___");
        
        newExercises.push({
          id: generateId(),
          sentence,
          baseWord: baseWord.trim(),
          correctForm: correctForm.trim(),
          position: index,
        });
      }
    });

    setExercises(newExercises);
    updateValue(newExercises);
  };

  const renderPreview = () => {
    return exercises.map((exercise, index) => {
      const sentenceWithBlank = exercise.sentence.replace(/\[\[.*?\]\]|\b_+\b/, "___");
      
      return (
        <div key={exercise.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {index + 1}
            </div>
            <span className="font-medium">Exercise {index + 1}</span>
          </div>
          
          <div className="text-sm mb-2">
            <span>{sentenceWithBlank.split("___")[0]}</span>
            <span className="inline-flex items-center gap-2">
              <Input 
                placeholder="..." 
                className="w-32 h-7 text-sm inline-block mx-1" 
                readOnly 
              />
              <span className="text-muted-foreground">({exercise.baseWord})</span>
            </span>
            <span>{sentenceWithBlank.split("___")[1]}</span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Correct answer: <span className="font-medium text-green-600">{exercise.correctForm}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="word-form-text" className="text-base font-medium">
          Question Instructions
        </Label>
        <Textarea
          id="word-form-text"
          value={value.text || ""}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder="Enter the question instructions (e.g., 'Fill in the correct form of the word given in parentheses')"
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Word Form Exercises</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="mr-1 h-4 w-4" /> Hide Preview
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-4 w-4" /> Show Preview
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Admin Syntax Input */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <Label className="font-medium">Admin Syntax (Quick Input)</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Use the format: &quot;He [[drive/drives]] to work every day.&quot; where the first word is the base form and the second is the correct form.
            </p>
            <Textarea
              value={adminSyntax}
              onChange={(e) => setAdminSyntax(e.target.value)}
              placeholder="He [[drive/drives]] to work every day.&#10;She [[beautiful/beautifully]] decorated the room.&#10;The [[child/children]] were playing in the park."
              className="min-h-[120px] font-mono text-sm"
            />
            <Button 
              type="button"
              onClick={parseAdminSyntax}
              disabled={!adminSyntax.trim()}
              size="sm"
            >
              Parse Syntax & Create Exercises
            </Button>
          </div>
        </Card>

        {/* Individual Exercise Editors */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <Card key={exercise.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <Label className="font-medium">Exercise {index + 1}</Label>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`sentence-${exercise.id}`}>Sentence</Label>
                    <Textarea
                      id={`sentence-${exercise.id}`}
                      value={exercise.sentence}
                      onChange={(e) => updateExercise(exercise.id, "sentence", e.target.value)}
                      placeholder="Enter the sentence with ___ or placeholder for the blank"
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`baseWord-${exercise.id}`}>Base Word</Label>
                      <Input
                        id={`baseWord-${exercise.id}`}
                        value={exercise.baseWord}
                        onChange={(e) => updateExercise(exercise.id, "baseWord", e.target.value)}
                        placeholder="e.g., drive, beautiful, child"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`correctForm-${exercise.id}`}>Correct Form</Label>
                      <Input
                        id={`correctForm-${exercise.id}`}
                        value={exercise.correctForm}
                        onChange={(e) => updateExercise(exercise.id, "correctForm", e.target.value)}
                        placeholder="e.g., drives, beautifully, children"
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
          variant="outline"
          onClick={addExercise}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Preview */}
      {showPreview && exercises.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Student View Preview</Label>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground border-l-4 border-primary/20 pl-4 py-2">
                <strong>Instructions:</strong> Fill in the correct form of the word given in parentheses.
              </div>
              <div className="space-y-4">
                {renderPreview()}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* AI Scoring Prompt */}
      <div className="space-y-4">
        <Label htmlFor="scoring-prompt" className="text-base font-medium">
          AI Scoring Prompt (Optional)
        </Label>
        <Textarea
          id="scoring-prompt"
          value={value.scoringPrompt || ""}
          onChange={(e) => onChange({ ...value, scoringPrompt: e.target.value })}
          placeholder="Custom AI scoring instructions for this question. Leave empty to use default prompt."
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          If provided, this prompt will be used by the AI to score student responses instead of the default scoring criteria.
        </p>
      </div>
    </div>
  );
}
