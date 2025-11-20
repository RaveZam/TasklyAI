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

    // Use Gemini 1.5 Flash (free tier, fast model)
    const model = "gemini-2.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `You are a task management assistant for students and small teams. Based on the following project description, generate 3-5 specific, actionable tasks that would help accomplish this goal. Tasks should be short and concise, and should be easy to understand and complete since you are talking to students and small teams.

For each task, provide:
- A clear, concise title (max 50 characters)
- A brief description explaining what needs to be done
- A priority level (Low, Medium, or High)

Project description: "${description}"

Return the response as a JSON array of tasks with this exact format:
[
  {
    "title": "Task title here",
    "description": "Task description here",
    "priority": "Low", "Medium", or "High"
  }
]

Only return the JSON array, no additional text or markdown formatting.`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
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
      .slice(0, 5) // Limit to 5 tasks max
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
