// Utility functions for AI scoring of writing tasks

export async function scoreEssayWithAI(
  prompt: string,
  essay: string,
  scoringPrompt?: string,
) {
  try {
    const defaultPrompt = `You are an IELTS examiner. Score the following essay on a scale of 1-9 based on the official IELTS Writing Task scoring criteria:
    
    Task Achievement/Response: How well the candidate addresses all parts of the task and presents a clear position or development of ideas.
    Coherence and Cohesion: How well the response is organized, with clear progression and appropriate use of cohesive devices.
    Lexical Resource: The range and accuracy of vocabulary used.
    Grammatical Range and Accuracy: The range and accuracy of grammar used.
    
    Provide a single overall band score (e.g., 6.5) followed by a brief explanation of the score.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          // model: process.env.OPENROUTER_MODEL_ID,
          messages: [
            {
              role: "system",
              content: scoringPrompt || defaultPrompt,
            },
            {
              role: "user",
              content: `Task: ${prompt}\n\nEssay: ${essay}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const scoreText = data.choices[0].message.content;

    // Extract the score from the response (looking for a number between 1.0 and 9.0)
    const scoreMatch = scoreText.match(/(\d+(\.\d+)?)/);
    if (scoreMatch) {
      const score = Number.parseFloat(scoreMatch[0]);
      // Ensure score is within IELTS range (1-9)
      const validScore = Math.min(Math.max(score, 1), 9);
      return {
        score: validScore,
        feedback: scoreText,
      };
    }

    throw new Error("Could not extract score from AI response");
  } catch (error) {
    console.error("Error scoring essay:", error);
    throw error;
  }
}
