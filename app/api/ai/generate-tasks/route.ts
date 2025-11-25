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
    const model = "gemini-2.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `You are an expert task management assistant specializing in helping students and small teams break down projects into actionable next steps. Your goal is to generate a prioritized, sequential list of tasks that will help users make immediate progress toward their project goal.

    Based on the following project description, generate 3-5 specific, actionable tasks that represent the logical next steps to accomplish this goal. Consider:
    
    1. **Task Sequencing**: Order tasks logically - foundational tasks should come before dependent ones. Think about what needs to happen first to unblock other work.
    
    2. **Actionability**: Each task should be:
       - Specific enough that someone knows exactly what to do
       - Small enough to be completed in a reasonable timeframe (hours to a few days)
       - Clear about the deliverable or outcome
    
    3. **Priority Assignment**:
       - **High**: Critical path items, blockers for other tasks, or time-sensitive work
       - **Medium**: Important but not blocking, or can be done in parallel
       - **Low**: Nice-to-have, can be deferred, or polish/optimization work
    
    4. **Context Awareness**: 
       - For academic projects: Consider research, planning, and documentation needs
       - For team projects: Consider collaboration, communication, and coordination tasks
       - Break down large goals into smaller, manageable chunks
    
    Project description: "${description}"
    
    Generate tasks that represent the immediate next steps (not the entire project). Focus on what should be done first to make progress.
    
    Return the response as a JSON array of tasks with this exact format:
    [
      {
        "title": "Task title here (max 50 characters)",
        "description": "Clear, actionable description in 1-2 sentences explaining what needs to be done and why",
        "priority": "Low" | "Medium" | "High"
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
