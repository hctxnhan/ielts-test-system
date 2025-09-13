"use client";
import React, { useEffect } from "react";
import TestPlayer from "@testComponents/components/test-player/test-player";
import { Button } from "@testComponents/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import { Textarea } from "@testComponents/components/ui/textarea";
import { updateQuestionIndexes } from "@testComponents/lib/test";
import type { Test } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { useState } from "react";
import { scoreEssay } from "../actions/score-essay";

export default function TestsPage() {
  const [testJson, setTestJson] = useState("");
  const [currentTest, setCurrentTest] = useState<Test>();

  const { progress, setSubmitResultFn, setScoreEssayFn } = useTestStore();

  useEffect(() => {
    // Set the function to handle test submission
    setSubmitResultFn(async (testId, results, config) => {
      return { success: true };
    });

    setScoreEssayFn(scoreEssay);

    return () => {
      // Cleanup function - we can't pass null, so we create a no-op function
      setSubmitResultFn(async () => ({ success: false }));
      setScoreEssayFn(async () => ({ feedback: "", score: 0, ok: false }));
    };
  }, [setSubmitResultFn, setScoreEssayFn]);

  const loadEnglishToVietnameseSample = () => {
    const sampleTest = {
      id: 3,
      title: "English to Vietnamese Translation Practice",
      type: "reading", 
      skill: "reading",
      description: "Practice translating sentences from English to Vietnamese.",
      instructions: "<p>Translate the given sentences from English to Vietnamese. Write your translations in the text boxes provided.</p>",
      tips: "<h3>🌐 Translation Tips</h3><ul><li><strong>Classifiers:</strong> Vietnamese uses classifiers (cái, con, người, etc.) with nouns</li><li><strong>Word order:</strong> Vietnamese adjectives usually come after nouns</li><li><strong>Tense markers:</strong> Use đã (past), đang (present continuous), sẽ (future)</li><li><strong>Formal vs informal:</strong> Choose appropriate pronouns based on context</li></ul>",
      vocabulary: "<h3>📖 Common Vietnamese Grammar</h3><dl><dt><strong>Pronouns</strong></dt><dd>I = tôi (formal), mình (informal) | You = bạn, anh/chị | He/She = anh ấy/cô ấy</dd><dt><strong>Common verbs</strong></dt><dd>to be = là | to have = có | to go = đi | to come = đến | to study = học</dd><dt><strong>Time expressions</strong></dt><dd>today = hôm nay | tomorrow = ngày mai | yesterday = hôm qua | now = bây giờ</dd></dl>",
      sections: [
        {
          id: "translation-section-2",
          title: "English to Vietnamese Translation", 
          description: "Translate the following English sentences to Vietnamese",
          duration: 1800,
          questions: [
            {
              id: "sentence-translation-q2",
              type: "sentence-translation",
              text: "<p>Translate the following sentences from English to Vietnamese:</p>",
              points: 4,
              scoringStrategy: "partial",
              index: 1,
              partialEndingIndex: 1,
              scoringPrompt: "Evaluate English to Vietnamese translation quality. Pay attention to Vietnamese grammar structure, proper use of classifiers, appropriate formal/informal register, and cultural context.",
              sentences: [
                {
                  id: "sent-en-1",
                  sourceText: "I love eating Vietnamese food.",
                  referenceTranslations: [
                    "Tôi thích ăn đồ ăn Việt Nam.",
                    "Tôi yêu thích ăn món ăn Việt Nam.",
                    "Tôi thích ăn món Việt.",
                    "Mình thích ăn đồ ăn Việt Nam."
                  ]
                },
                {
                  id: "sent-en-2",
                  sourceText: "The weather in Ho Chi Minh City is very hot.",
                  referenceTranslations: [
                    "Thời tiết ở Thành phố Hồ Chí Minh rất nóng.",
                    "Trời ở Sài Gòn rất nóng.",
                    "Thời tiết ở Sài Gòn rất nóng.",
                    "Trời ở Thành phố Hồ Chí Minh rất nóng."
                  ]
                },
                {
                  id: "sent-en-3", 
                  sourceText: "My family will visit Hanoi next month.",
                  referenceTranslations: [
                    "Gia đình tôi sẽ đến thăm Hà Nội vào tháng tới.",
                    "Gia đình tôi sẽ đi du lịch Hà Nội tháng sau.",
                    "Gia đình mình sẽ đến Hà Nội vào tháng tới.",
                    "Nhà tôi sẽ đi Hà Nội tháng sau."
                  ]
                },
                {
                  id: "sent-en-4",
                  sourceText: "She is learning to cook traditional Vietnamese dishes.",
                  referenceTranslations: [
                    "Cô ấy đang học nấu các món ăn truyền thống Việt Nam.",
                    "Chị ấy đang học nấu những món ăn truyền thống của Việt Nam.",
                    "Cô ấy đang học nấu món ăn truyền thống Việt.",
                    "Chị ấy đang học nấu ăn truyền thống Việt Nam."
                  ]
                }
              ],
              sourceLanguage: "english",
              targetLanguage: "vietnamese"
            }
          ]
        }
      ],
      totalDuration: 1800,
      totalQuestions: 4,
      skillLevel: "B2"
    };

    setTestJson(JSON.stringify(sampleTest, null, 2));
  };

  const handleStartTest = () => {
    try {
      // Parse the JSON test object
      const testObject: Test = JSON.parse(testJson);

      const test = updateQuestionIndexes(testObject);

      setCurrentTest(test);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      alert("Invalid JSON format. Please check your input.");
    }
  };

  const loadSampleWithTipsAndVocab = () => {
    const sampleTest = {
      id: 1,
      title: "IELTS Reading Practice Test with Tips & Vocabulary",
      type: "reading",
      skill: "reading",
      description:
        "A practice reading test with helpful tips and vocabulary support.",
      instructions:
        "<p>Read the passage below and answer the questions that follow. You have 60 minutes to complete all sections.</p>",
      tips: "<h3>📚 Reading Tips</h3><ul><li><strong>Skim first:</strong> Quickly read through the passage to get the general idea before attempting questions</li><li><strong>Keywords:</strong> Identify keywords in questions and locate them in the passage</li><li><strong>Time management:</strong> Spend about 20 minutes per section</li><li><strong>Don't panic:</strong> If you can't find an answer, move on and come back later</li></ul>",
      vocabulary:
        "<h3>📖 Key Vocabulary</h3><dl><dt><strong>Biodiversity</strong></dt><dd>The variety of plant and animal life in the world or in a particular habitat</dd><dt><strong>Ecosystem</strong></dt><dd>A biological community of interacting organisms and their physical environment</dd><dt><strong>Conservation</strong></dt><dd>The protection of plants, animals, and natural areas</dd><dt><strong>Sustainable</strong></dt><dd>Able to be maintained at a certain rate or level without depleting natural resources</dd></dl>",
      sections: [
        {
          id: "bbe0906d-59ed-46be-a8a6-673bcbd83d2e",
          title: "Part 1",
          description: "",
          questions: [
            {
              id: "ae5f0453-87c3-449b-ab91-b1b34f017163",
              type: "multiple-choice",
              text: "<p>asdf</p>",
              points: 1,
              scoringStrategy: "all-or-nothing",
              index: 1,
              options: [
                {
                  id: "d8256ae6-6118-480f-97a3-8be4601f16bb",
                  text: "asdf",
                  isCorrect: true,
                },
                {
                  id: "fcc5a147-5276-4841-86c8-d86c79c0dcd0",
                  text: "asdf",
                  isCorrect: false,
                },
                {
                  id: "d59d8e11-dcac-46ba-b58c-cf6f47b8a47a",
                  text: "asdf",
                  isCorrect: false,
                },
                {
                  id: "b1f064f3-8d2a-4bbf-8571-02a60a1e131a",
                  text: "asdf",
                  isCorrect: false,
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_image-1749889654261.png",
            },
            {
              id: "646dbac1-11cf-422f-b9ff-e9716711ea75",
              type: "completion",
              text: "<p>asdfasdf ___</p>",
              points: 1,
              scoringStrategy: "partial",
              index: 2,
              blanks: 1,
              subQuestions: [
                {
                  subId: "747988a5-c06a-443a-9d95-b9c18db5d054",
                  correctAnswer: "",
                  points: 1,
                  acceptableAnswers: ["asdfasdf"],
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_iScreen%20Shoter%20-%20Google%20Chrome%20-%20250614152326-1749889698298.jpg",
            },
            {
              id: "99a357b4-1442-411b-b2b5-9e681d7a0858",
              type: "matching",
              text: "<p>asdfasdf</p>",
              points: 1,
              scoringStrategy: "partial",
              index: 3,
              items: [
                {
                  id: "7f32be36-f85c-4c19-8531-0c66ca16cc44",
                  text: "asdf",
                },
                {
                  id: "5dfe06e8-827e-4558-806b-9ca847c02156",
                  text: "asdf",
                },
              ],
              options: [
                {
                  id: "46f9e5a0-1e84-4d9c-8804-fc6175bb9176",
                  text: "asfd",
                },
                {
                  id: "95ca2e1a-7c07-4c82-8af2-e37a50c6e875",
                  text: "asdf",
                },
              ],
              subQuestions: [
                {
                  subId: "7a856197-a8bc-409f-9f62-ed75bbb6fe5c",
                  subIndex: 1,
                  item: "7f32be36-f85c-4c19-8531-0c66ca16cc44",
                  correctAnswer: "46f9e5a0-1e84-4d9c-8804-fc6175bb9176",
                  points: 1,
                },
                {
                  subId: "5443463d-8fb4-466d-8ce0-a5bfb9ba2235",
                  subIndex: 2,
                  item: "5dfe06e8-827e-4558-806b-9ca847c02156",
                  correctAnswer: "95ca2e1a-7c07-4c82-8af2-e37a50c6e875",
                  points: 1,
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_Screenshot%202025-03-03%20at%2015.25.58-1744646016805.png",
            },
            {
              id: "53a9da8c-aa39-4de0-b4f5-ac1c38ac01e5",
              type: "pick-from-a-list",
              text: "<p>asdfasdf</p>",
              points: 1,
              scoringStrategy: "partial",
              index: 4,
              partialEndingIndex: 0,
              items: [
                {
                  id: "e610c5bb-829e-4f95-b213-0151b0671df3",
                  text: "asdfa",
                },
                {
                  id: "13b0e2e2-540a-4d3e-85f4-245e9b4cb9ee",
                  text: "asd",
                },
                {
                  id: "c88d9ef5-973c-4e62-8d8e-b54156e1ed29",
                  text: "fa",
                },
                {
                  id: "3bf68c43-d037-412b-a6e9-3648835fa456",
                  text: "sdfasdf",
                },
              ],
              subQuestions: [
                {
                  subId: "49d47559-c316-4557-bd56-54ea0728ebfc",
                  item: "e610c5bb-829e-4f95-b213-0151b0671df3",
                  correctAnswer: "true",
                  points: 1,
                },
                {
                  subId: "104f1ae7-bb9d-497a-ab27-ee9196a77a82",
                  item: "c88d9ef5-973c-4e62-8d8e-b54156e1ed29",
                  correctAnswer: "true",
                  points: 1,
                  subIndex: 1,
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_listen-1747462225481.png",
            },
          ],
          duration: 600,
          readingPassage: {
            id: "e3ee3ec2-c09d-458b-ab1f-16a5ab981245",
            title: "",
            content: "",
            hasImages: false,
            imageUrls: [],
          },
        },
      ],
      totalDuration: 3600,
      totalQuestions: 1,
      skillLevel: "B2",
    };

    setTestJson(JSON.stringify(sampleTest, null, 2));
  };

  const loadSentenceTranslationSample = () => {
    const sampleTest = {
      id: 2,
      title: "Sentence Translation Practice Test",
      type: "reading",
      skill: "reading",
      description: "Practice translating sentences between Vietnamese and English.",
      instructions: "<p>Translate the given sentences from Vietnamese to English. Write your translations in the text boxes provided.</p>",
      tips: "<h3>🌐 Translation Tips</h3><ul><li><strong>Context matters:</strong> Consider the context to choose the most appropriate translation</li><li><strong>Grammar structure:</strong> Pay attention to word order differences between languages</li><li><strong>Natural expression:</strong> Aim for natural-sounding translations, not word-for-word</li><li><strong>Cultural nuances:</strong> Some concepts may not translate directly</li></ul>",
      vocabulary: "<h3>📖 Common Translation Patterns</h3><dl><dt><strong>Present tense markers</strong></dt><dd>Vietnamese: đang, đã | English: am/is/are + -ing, have/has + past participle</dd><dt><strong>Question words</strong></dt><dd>ai = who, gì = what, ở đâu = where, khi nào = when, tại sao = why</dd><dt><strong>Sentence structure</strong></dt><dd>Vietnamese: Subject + Verb + Object | English: Subject + Verb + Object (similar but with different modifiers)</dd></dl>",
      sections: [
        {
          id: "translation-section-1",
          title: "Vietnamese to English Translation",
          description: "Translate the following Vietnamese sentences to English",
          duration: 1800,
          questions: [
            {
              id: "sentence-translation-q1",
              type: "sentence-translation",
              text: "<p>Translate the following sentences from Vietnamese to English:</p>",
              points: 5,
              scoringStrategy: "partial",
              index: 1,
              partialEndingIndex: 1,
              scoringPrompt: "Evaluate Vietnamese to English translation quality focusing on accuracy, natural expression, and grammar. Consider cultural context and idiomatic usage.",
              sentences: [
                {
                  id: "sent-1",
                  sourceText: "Tôi đang học tiếng Anh tại trường đại học.",
                  referenceTranslations: [
                    "I am studying English at university.",
                    "I am learning English at university.",
                    "I'm studying English at the university.",
                    "I'm learning English at the university."
                  ]
                },
                {
                  id: "sent-2", 
                  sourceText: "Hôm nay trời đẹp và có nắng.",
                  referenceTranslations: [
                    "Today is beautiful and sunny.",
                    "The weather is beautiful and sunny today.",
                    "It's a beautiful and sunny day today.",
                    "Today the weather is nice and sunny."
                  ]
                },
                {
                  id: "sent-3",
                  sourceText: "Chúng tôi sẽ đi du lịch vào cuối tuần này.",
                  referenceTranslations: [
                    "We will travel this weekend.",
                    "We are going to travel this weekend.",
                    "We will go traveling this weekend.",
                    "We're going to go on a trip this weekend."
                  ]
                },
                {
                  id: "sent-4",
                  sourceText: "Cô ấy thích đọc sách và nghe nhạc.",
                  referenceTranslations: [
                    "She likes reading books and listening to music.",
                    "She enjoys reading books and listening to music.",
                    "She likes to read books and listen to music.",
                    "She enjoys reading and listening to music."
                  ]
                },
                {
                  id: "sent-5",
                  sourceText: "Bạn có thể giúp tôi làm bài tập về nhà không?",
                  referenceTranslations: [
                    "Can you help me with my homework?",
                    "Could you help me with my homework?",
                    "Can you help me do my homework?",
                    "Would you help me with my homework?"
                  ]
                }
              ],
              sourceLanguage: "vietnamese",
              targetLanguage: "english"
            }
          ]
        }
      ],
      totalDuration: 1800,
      totalQuestions: 5,
      skillLevel: "B1"
    };

    setTestJson(JSON.stringify(sampleTest, null, 2));
  };

  const loadGrammarTestSample = () => {
    const sampleTest = {
      id: 4,
      title: "Grammar Practice Test",
      type: "grammar",
      skill: "grammar",
      description: "Practice grammar with translation and other exercises.",
      instructions: "<p>Complete the grammar exercises below. For translation questions, provide accurate and natural-sounding translations. Pay attention to sentence structure, tenses, and language patterns.</p>",
      tips: "<h3>📚 Grammar Tips</h3><ul><li><strong>Translation accuracy:</strong> Focus on meaning and natural expression</li><li><strong>Sentence structure:</strong> Pay attention to word order in both languages</li><li><strong>Tense consistency:</strong> Maintain appropriate tense throughout</li><li><strong>Context matters:</strong> Consider the situation when translating</li></ul>",
      vocabulary: "<h3>📖 Key Grammar Points</h3><dl><dt><strong>Vietnamese Sentence Structure</strong></dt><dd>Subject + Verb + Object (SVO) | Adjectives typically follow nouns</dd><dt><strong>Tense Markers</strong></dt><dd>Past: đã + verb | Present continuous: đang + verb | Future: sẽ + verb</dd><dt><strong>Classifiers</strong></dt><dd>cái (objects), con (animals), người (people), chiếc (vehicles)</dd></dl>",
      sections: [
        {
          id: "grammar-section-1",
          title: "Translation Practice",
          description: "Translate sentences accurately between Vietnamese and English",
          duration: 900,
          questions: [
            {
              id: "g1",
              type: "sentence-translation",
              text: "Translate the following sentence from English to Vietnamese:",
              points: 10,
              scoringStrategy: "all-or-nothing",
              index: 0,
              partialEndingIndex: 0,
              sourceText: "I am studying Vietnamese at the university.",
              referenceTranslation: "Tôi đang học tiếng Việt ở trường đại học.",
              sourceLanguage: "english",
              targetLanguage: "vietnamese",
              scoringPrompt: "Evaluate English to Vietnamese translation quality. Check for correct use of 'đang' for present continuous, appropriate subject pronoun 'tôi', and proper vocabulary choices."
            },
            {
              id: "g2", 
              type: "sentence-translation",
              text: "Translate the following sentence from Vietnamese to English:",
              points: 10,
              scoringStrategy: "all-or-nothing",
              index: 1,
              partialEndingIndex: 1,
              sourceText: "Hôm qua tôi đã đi chợ với mẹ.",
              referenceTranslation: "Yesterday I went to the market with my mother.",
              sourceLanguage: "vietnamese",
              targetLanguage: "english",
              scoringPrompt: "Evaluate Vietnamese to English translation accuracy. Check for correct past tense usage, proper translation of 'chợ' as market, and natural English expression."
            },
            {
              id: "g3",
              type: "sentence-translation", 
              text: "Translate the following sentence from English to Vietnamese:",
              points: 10,
              scoringStrategy: "all-or-nothing",
              index: 2,
              partialEndingIndex: 2,
              sourceText: "The book on the table belongs to my sister.",
              referenceTranslation: "Quyển sách trên bàn là của chị gái tôi.",
              sourceLanguage: "english",
              targetLanguage: "vietnamese",
              scoringPrompt: "Evaluate translation focusing on classifier usage 'quyển' for books, preposition 'trên' for 'on', and possessive structure 'của + person'."
            }
          ]
        }
      ],
      totalDuration: 900,
      totalQuestions: 3,
      skillLevel: "B1"
    };

    setTestJson(JSON.stringify(sampleTest, null, 2));
  };

  return (
    <main className="mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Test Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your test JSON here..."
              className="font-mono h-80"
              value={testJson}
              onChange={(e) => setTestJson(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Button variant="outline" onClick={loadSampleWithTipsAndVocab} className="w-full">
                  Load Sample with Tips & Vocabulary
                </Button>
                <Button variant="outline" onClick={loadSentenceTranslationSample} className="w-full">
                  Load Vietnamese → English Translation
                </Button>
                <Button variant="outline" onClick={loadEnglishToVietnameseSample} className="w-full">
                  Load English → Vietnamese Translation
                </Button>
                <Button variant="outline" onClick={loadGrammarTestSample} className="w-full">
                  Load Grammar Test with Translation
                </Button>
              </div>
              <div className="flex items-end">
                <Button onClick={handleStartTest} className="w-full h-12">Start Test</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="h-10" />
      {progress && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {JSON.stringify(progress.answers, null, 2)}
          </p>
        </div>
      )}
      <div className="h-10" />

      {currentTest && <TestPlayer test={currentTest} />}
    </main>
  );
}
