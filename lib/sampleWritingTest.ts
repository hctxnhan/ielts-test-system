import type { Test } from "@testComponents/lib/types";
import { v4 as uuidv4 } from "uuid";

// Add a sample writing test
export const sampleWritingTest: Test = {
  id: "sample-writing-1",
  title: "IELTS Academic Writing Practice Test 1",
  type: "writing",
  description: "A complete IELTS Academic Writing test with 2 tasks.",
  totalDuration: 3600, // 60 minutes
  totalQuestions: 2,
  instructions:
    "You should spend about 20 minutes on Task 1 and 40 minutes on Task 2. Task 2 contributes twice as much to your final score as Task 1.",
  sections: [
    {
      id: uuidv4(),
      title: "Writing Tasks",
      description: "Complete both writing tasks.",
      duration: 3600, // 60 minutes
      questions: [
        {
          id: uuidv4(),
          type: "writing-task1",
          text: "Task 1",
          points: 8,
          prompt:
            "The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          imageUrl: "/placeholder.svg?height=400&width=600",
          wordLimit: 150,
          scoringStrategy: "all-or-nothing",
        },
        {
          id: uuidv4(),
          type: "writing-task2",
          text: "Task 2",
          points: 12,
          prompt:
            "Some people believe that university students should pay all the cost of their studies. Others believe that university education should be free. Discuss both views and give your opinion.",
          wordLimit: 250,
          scoringStrategy: "all-or-nothing",
        },
      ],
    },
  ],
};
