import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question } from "../types";

// Initialize Gemini
// NOTE: API Key is managed via process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stem: {
      type: Type.STRING,
      description: "The math problem text. Use unicode characters for math symbols (e.g., x², π, √, θ, ≤).",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 multiple choice options. Use unicode for math symbols.",
    },
    correctIndex: {
      type: Type.INTEGER,
      description: "The index (0-3) of the correct answer.",
    },
    explanation: {
      type: Type.STRING,
      description: "A comprehensive educational explanation. Must include 'Solution', 'Common Pitfalls', and 'Pro Tip'.",
    },
    topic: {
      type: Type.STRING,
      description: "The specific sub-topic (e.g., 'Nonlinear Equations', 'Circle Theorems').",
    },
    svg: {
      type: Type.STRING,
      description: "Optional. A raw SVG string (<svg viewBox='0 0 400 300' ...>...</svg>) to visualize the problem. REQUIRED for Geometry (draw the shape) and Trigonometry. For Graphs, draw the function. Keep styling minimal (black lines, transparent background).",
    },
    explanationSvg: {
      type: Type.STRING,
      description: "Optional. A raw SVG string to visualize the solution (e.g., the graph of the function highlighting the intercept).",
    },
  },
  required: ["stem", "options", "correctIndex", "explanation", "topic"],
};

export const generateMathQuestion = async (difficulty: number): Promise<Question> => {
  // Map internal difficulty (1-10) to prompt context
  let difficultyDescription = "";
  if (difficulty >= 9) {
    difficultyDescription = "Extremely Hard (SAT Question 22 level). Involves abstract constants, complex geometry, or multi-step nonlinear systems.";
  } else if (difficulty >= 7) {
    difficultyDescription = "Very Hard (SAT Question 18-21 level). Requires synthesis of multiple concepts.";
  } else if (difficulty >= 5) {
    difficultyDescription = "Hard (SAT Module 2 Hard level). Standard advanced math.";
  } else {
    difficultyDescription = "Medium-Hard. Foundation advanced concepts.";
  }

  const prompt = `
    Create a single multiple-choice Math question for the Digital SAT.
    
    Target Difficulty: ${difficultyDescription}
    
    Requirements:
    1. The question must simulate the 'Bluebook' app experience.
    2. Focus on: Advanced Algebra, Geometry/Trigonometry, or Problem Solving/Data Analysis.
    3. VISUALS:
       - If the topic is GEOMETRY or TRIGONOMETRY: You MUST provide an 'svg' field drawing the shape (triangle, circle, etc.) with labels.
       - If the topic involves FUNCTIONS (parabolas, exponentials): You MUST provide an 'explanationSvg' graphing the function to help the student understand the solution.
    4. Ensure the numbers and logic are strictly accurate.
    5. Provide 4 distinct options.
    6. Explanation: MUST be detailed. Include a breakdown of why the correct answer is right, why the specific distractors are wrong, and a 'Pro Tip'.
    
    SVG Guidelines:
    - Use <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">.
    - Use dark strokes (stroke="black" stroke-width="2").
    - Use clear text labels (font-size="14" fill="black").
    - Do not use markdown code blocks for the SVG, put the raw string in the JSON field.
    
    Return the result strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7, // Lower temperature for more accurate math/SVG
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    return {
      id: Date.now().toString(),
      stem: data.stem,
      options: data.options,
      correctIndex: data.correctIndex,
      explanation: data.explanation,
      topic: data.topic,
      difficultyLevel: difficulty,
      svg: data.svg,
      explanationSvg: data.explanationSvg,
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};