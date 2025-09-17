"use server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject, jsonSchema } from "ai";

interface ScoringParams {
  text: string;
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
  text: string,
  prompt: string,
  essay: string,
  scoringPrompt?: string
) {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY
    });
    const model = openrouter(process.env.OPENROUTER_MODEL_ID || '');

    // Use the provided scoring prompt or a generic fallback
    const promptToUse = scoringPrompt || `
    You are an expert language examiner. Evaluate the response based on the context and criteria provided.
    
    Provide an appropriate numerical score and detailed feedback in markdown format.
    `;

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }

    const fullPrompt = `
      ${promptToUse}

      **Context/Question:** ${text}
      **Task/Prompt:** ${prompt}
      **Student Response:** ${essay}
      
      IMPORTANT: Your explanation should be plain text in markdown format. DO NOT wrap your feedback in JSON or quotes DO NOT mention the score in the feedback, and DO NOT include nested JSON objects in your response.
      
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
        'X-Title': 'IELTS Insight' // Add a title for API tracking
      }
    });


    if (
      !result ||
      !result.object ||
      typeof result.object.score !== "number" ||
      !result.object.detailedBreakdown
    ) {
      throw new Error('Invalid response from AI model');
    }

    // Process explanation to ensure it's not a JSON string
    let feedback = result.object.detailedBreakdown;

    // Check if explanation is accidentally returned as a JSON string
    try {
      const parsedFeedback = JSON.parse(feedback);
      if (
        parsedFeedback &&
        typeof parsedFeedback === 'object' &&
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
      feedback
    };
  } catch (error) {
    console.error('Error scoring essay:', error);
    throw error;
  }
}

export async function scoreEssay(
  params: ScoringParams,
): Promise<ScoringResult> {
  try {
    const { text, prompt, essay, scoringPrompt } = params;

    if (!essay || essay.trim().length === 0) {
      return {
        ok: false,
        score: 0,
        feedback: "No content provided for scoring.",
        error: "Essay content is empty",
      };
    }

    const result = await scoreEssayWithAI(text, prompt, essay, scoringPrompt);

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
      feedback: "Unable to score your response. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
