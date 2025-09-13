"use client";

import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Label } from "@testComponents/components/ui/label";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@testComponents/components/ui/select";
import { PlusCircle, X } from "lucide-react";
import type { SentenceTranslationQuestion } from "@testComponents/lib/types";
import { v4 as uuidv4 } from "uuid";

interface SentenceTranslationEditorProps {
  question: SentenceTranslationQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<SentenceTranslationQuestion>
  ) => void;
}

export default function SentenceTranslationEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: SentenceTranslationEditorProps) {
  const handleLanguageChange = (sourceLanguage: "vietnamese" | "english") => {
    const targetLanguage = sourceLanguage === "vietnamese" ? "english" : "vietnamese";
    onUpdateQuestion(sectionId, question.id, {
      sourceLanguage,
      targetLanguage,
    });
  };

  const addSentence = () => {
    const newSentence = {
      id: uuidv4(),
      sourceText: "",
      referenceTranslations: [""],
    };
    const updatedSentences = [...(question.sentences || []), newSentence];
    onUpdateQuestion(sectionId, question.id, {
      sentences: updatedSentences,
    });
  };

  const removeSentence = (sentenceIndex: number) => {
    const updatedSentences = question.sentences?.filter((_, index) => index !== sentenceIndex) || [];
    onUpdateQuestion(sectionId, question.id, {
      sentences: updatedSentences,
    });
  };

  const updateSentenceSourceText = (sentenceIndex: number, sourceText: string) => {
    const updatedSentences = [...(question.sentences || [])];
    updatedSentences[sentenceIndex] = {
      ...updatedSentences[sentenceIndex],
      sourceText,
    };
    onUpdateQuestion(sectionId, question.id, {
      sentences: updatedSentences,
    });
  };

  const updateReferenceTranslation = (sentenceIndex: number, translationIndex: number, translation: string) => {
    const updatedSentences = [...(question.sentences || [])];
    const sentence = { ...updatedSentences[sentenceIndex] };
    const referenceTranslations = [...(sentence.referenceTranslations || [])];
    referenceTranslations[translationIndex] = translation;
    sentence.referenceTranslations = referenceTranslations;
    updatedSentences[sentenceIndex] = sentence;
    
    onUpdateQuestion(sectionId, question.id, {
      sentences: updatedSentences,
    });
  };

  const addReferenceTranslation = (sentenceIndex: number) => {
    const updatedSentences = [...(question.sentences || [])];
    const sentence = { ...updatedSentences[sentenceIndex] };
    const referenceTranslations = [...(sentence.referenceTranslations || []), ""];
    sentence.referenceTranslations = referenceTranslations;
    updatedSentences[sentenceIndex] = sentence;
    
    onUpdateQuestion(sectionId, question.id, {
      sentences: updatedSentences,
    });
  };

  const removeReferenceTranslation = (sentenceIndex: number, translationIndex: number) => {
    const updatedSentences = [...(question.sentences || [])];
    const sentence = { ...updatedSentences[sentenceIndex] };
    const referenceTranslations = sentence.referenceTranslations?.filter((_, index) => index !== translationIndex) || [];
    sentence.referenceTranslations = referenceTranslations;
    updatedSentences[sentenceIndex] = sentence;
    
    onUpdateQuestion(sectionId, question.id, {
      sentences: updatedSentences,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Source Language</Label>
          <Select
            value={question.sourceLanguage || "vietnamese"}
            onValueChange={(value: "vietnamese" | "english") => handleLanguageChange(value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select source language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vietnamese">Vietnamese</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Target Language</Label>
          <div className="flex items-center h-8 text-xs border rounded bg-muted/20 px-2.5 capitalize">
            {question.targetLanguage || "english"}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">AI Scoring Prompt (Optional)</Label>
        <Textarea
          value={question.scoringPrompt || ""}
          onChange={(e) => onUpdateQuestion(sectionId, question.id, { scoringPrompt: e.target.value })}
          placeholder="Custom instructions for AI scoring. If empty, default scoring criteria will be used."
          className="min-h-[80px] text-sm"
        />
        <p className="text-xs text-muted-foreground">
          This prompt will guide the AI when scoring student translations. Include specific criteria you want the AI to focus on.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium">Sentences to Translate</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addSentence}
            className="h-7 text-xs"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Sentence
          </Button>
        </div>

        {question.sentences?.length === 0 || !question.sentences ? (
          <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
            No sentences added yet. Click &quot;Add Sentence&quot; to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {question.sentences.map((sentence, sentenceIndex) => (
              <div
                key={sentence.id}
                className="space-y-2 border border-muted/70 p-3 rounded bg-muted/10"
              >
                <div className="flex gap-2 items-start">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted/50 text-xs font-medium shrink-0 mt-0.5">
                    {sentenceIndex + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Source Text ({question.sourceLanguage === "vietnamese" ? "Vietnamese" : "English"})
                      </Label>
                      <Textarea
                        value={sentence.sourceText}
                        onChange={(e) => updateSentenceSourceText(sentenceIndex, e.target.value)}
                        placeholder={`Enter sentence in ${question.sourceLanguage === "vietnamese" ? "Vietnamese" : "English"}...`}
                        className="min-h-[60px] text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Reference Translations ({question.targetLanguage === "vietnamese" ? "Vietnamese" : "English"}) - Optional
                      </Label>
                      
                      {(sentence.referenceTranslations || [""]).map((translation, translationIndex) => (
                        <div key={translationIndex} className="flex gap-2 items-start">
                          <Textarea
                            value={translation}
                            onChange={(e) => updateReferenceTranslation(sentenceIndex, translationIndex, e.target.value)}
                            placeholder={`Reference translation ${translationIndex + 1} in ${question.targetLanguage === "vietnamese" ? "Vietnamese" : "English"}...`}
                            className="min-h-[50px] text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 mt-1"
                            onClick={() => removeReferenceTranslation(sentenceIndex, translationIndex)}
                            disabled={(sentence.referenceTranslations?.length || 0) <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addReferenceTranslation(sentenceIndex)}
                        className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50"
                      >
                        <PlusCircle className="mr-1.5 h-3 w-3" /> Add Alternative Translation
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeSentence(sentenceIndex)}
                    disabled={question.sentences?.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
