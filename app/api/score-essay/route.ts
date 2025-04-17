import { type NextRequest, NextResponse } from "next/server";
import { scoreEssayWithAI } from "@testComponents/lib/ai-scoring";

export async function POST(request: NextRequest) {
  try {
    const { prompt, essay, scoringPrompt } = await request.json();

    if (!essay || essay.trim().length < 50) {
      return NextResponse.json(
        { error: "Essay is too short to score" },
        { status: 400 }
      );
    }

    const result = await scoreEssayWithAI(prompt, essay, scoringPrompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in score-essay API route:", error);
    return NextResponse.json(
      { error: "Failed to score essay" },
      { status: 500 }
    );
  }
}
