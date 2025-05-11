"use server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject, jsonSchema } from "ai";

interface ScoringParams {
  prompt: string;
  essay: string;
  scoringPrompt: string;
}

interface ScoringResult {
  ok: boolean;
  score: number;
  feedback: string;
  error?: string;
}

interface AIScoreResponse {
  score: number;
  detailedBreakdown: string;
}

const schema = jsonSchema<AIScoreResponse>({
  type: "object",
  properties: {
    score: {
      type: "number",
      description: "The score given to the essay",
      example: 7.5,
    },
    detailedBreakdown: {
      type: "string",
      description: "A detailed explanation/breakdown of why the score given.",
    },
  },
  required: ["score", "detailedBreakdown"],
  additionalProperties: false,
});

export async function scoreEssayWithAI(
  prompt: string,
  essay: string,
  scoringPrompt?: string,
) {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    const model = openrouter(
      process.env.OPENROUTER_MODEL_ID || "google/gemini-2.5-pro-exp-03-25:free",
    );

    // Refined instruction prompt for the AI model
    const instruction = `
    You are an expert Vietnamese IELTS examiner. Your task is to evaluate the provided IELTS Writing Task essay based on the official scoring criteria.

    Provide a score between 1 and 9 (can include decimals like 7.5) and detailed feedback in Vietnamese.
    `;

    // Default scoring criteria details (can be overridden by scoringPrompt)
    const defaultPrompt = `
    **Scoring Criteria Details (Evaluate based on these):**

    *   **Task Achievement/Response (Mức độ hoàn thành yêu cầu):** Assess how well the essay addresses all parts of the task prompt, develops a clear position, and presents relevant, extended, and supported ideas.
    *   **Coherence and Cohesion (Tính mạch lạc và liên kết):** Evaluate the organization of information and ideas, the clarity of progression throughout the response, and the effective use of cohesive devices (linking words, pronouns, etc.). Check paragraphing.
    *   **Lexical Resource (Vốn từ vựng):** Assess the range of vocabulary used, its accuracy, appropriateness for the task, and the control of features like collocation and word formation.
    *   **Grammatical Range and Accuracy (Độ đa dạng và chính xác của ngữ pháp):** Evaluate the range and accuracy of grammatical structures used, including sentence complexity and control over errors.
    `;

    // Use the provided scoringPrompt if available (e.g., focusing on specific aspects), otherwise use the default criteria details
    const promptToUse = scoringPrompt
      ? `**Custom Scoring Focus:**\n${scoringPrompt}`
      : defaultPrompt;

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    const fullPrompt = `
      ${instruction}
      ${promptToUse}

      **Task:** ${prompt}
      **Essay:** ${essay}
      **Score:** Provide a score between 1 and 9 (can include decimals like 7.5).
      **Feedback:** Provide detailed feedback/breakdown in Vietnamese using markdown formatting.
      
      IMPORTANT: Your explanation should be plain text in markdown format. DO NOT wrap your feedback in JSON or quotes DO NOT mention the score in here, and DO NOT include nested JSON objects in your response.
      
      Return your response in this exact JSON structure:
      {
        "score": <numeric_score>,
        "detailedBreakdown": <detailed_breakdown>
      }
    `;

    const result = await generateObject({
      prompt: fullPrompt,
      model,
      schema,
      headers: {
        "X-Title": "IELTS Insight", // Add a title for API tracking
      },
    });

    if (
      !result ||
      !result.object ||
      !result.object.score ||
      !result.object.detailedBreakdown
    ) {
      throw new Error("Invalid response from AI model");
    }

    // Process explanation to ensure it's not a JSON string
    let feedback = result.object.detailedBreakdown;

    // Check if explanation is accidentally returned as a JSON string
    try {
      const parsedFeedback = JSON.parse(feedback);
      if (
        parsedFeedback &&
        typeof parsedFeedback === "object" &&
        parsedFeedback.detailedBreakdown
      ) {
        // If it parsed as JSON and has an explanation field, use that instead
        feedback = parsedFeedback.detailedBreakdown;
      }
    } catch (e) {
      // Not a JSON string, which is good - use as is
    }

    return {
      score: result.object.score,
      feedback,
    };
  } catch (error) {
    console.error("Error scoring essay:", error);
    throw error;
  }
}

export async function scoreEssay(
  params: ScoringParams,
): Promise<ScoringResult> {
  try {
    const { prompt, essay, scoringPrompt } = params;

    if (!essay || essay.trim().length === 0) {
      return {
        ok: false,
        score: 0,
        feedback: "No content provided for scoring.",
        error: "Essay content is empty",
      };
    }

    const result = await scoreEssayWithAI(prompt, essay, scoringPrompt);

    return {
      ok: true,
      score: result.score,
      feedback: result.feedback,
    };
  } catch (error) {
    console.error("Error in essay scoring server action:", error);
    return {
      ok: false,
      score: 0,
      feedback: "Unable to score your essay. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
