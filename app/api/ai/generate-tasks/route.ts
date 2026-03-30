import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Use Gemini 2.5 Flash (free tier, fast model)
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemInstruction = `You are a helpful study and project assistant for students. Your job is to break down projects into simple, clear tasks that are easy to understand and act on.

RULES:
- Write like you're talking to a student, not an engineer. Keep language simple and direct.
- Task titles should be short and clear — 3 to 6 words max (e.g. "Build the login page", "Connect to the database").
- Task descriptions should be 2-3 sentences: what to do, how to do it, and what done looks like. No jargon unless it's obvious from the description.
- Avoid overly technical or corporate language. A task like "Implement OAuth2 token refresh lifecycle" should just be "Set up Google login".
- If the project is already in progress, skip setup steps and focus on what comes next.
- Order tasks so the most important or first thing to do comes first.`;

    const userPrompt = `Project description: "${description}"

Generate 5-7 simple, clear tasks that a student can start working on right away.

Priority rules:
- High: Must be done first or blocks everything else
- Medium: Important but can be done alongside other tasks
- Low: Nice to have, or can be done last

Return ONLY a JSON array in this exact format, no markdown, no extra text:
[
  {
    "title": "Short task title (3-6 words)",
    "description": "2-3 sentences explaining what to do, how to do it, and what it looks like when it's done.",
    "priority": "Low" | "Medium" | "High"
  }
]`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate tasks from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the generated text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      return NextResponse.json(
        { error: "No content generated from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON from the response
    let tasks;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = generatedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      tasks = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Validate and format tasks
    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid task format from AI" },
        { status: 500 }
      );
    }

    // Ensure tasks have required fields and valid priorities
    const formattedTasks = tasks
      .filter(
        (task) =>
          task.title &&
          task.description &&
          ["Low", "Medium", "High"].includes(task.priority)
      )
      .slice(0, 12) // Limit to 12 tasks max
      .map((task) => ({
        title: String(task.title).trim(),
        description: String(task.description).trim(),
        priority: task.priority as "Low" | "Medium" | "High",
      }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error("Error generating tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
