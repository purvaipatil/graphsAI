import { NextResponse } from "next/server"

// import ollama from 'ollama'

import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Construct a prompt that specifically asks for mathematical equations
    const enhancedPrompt = `
      Generate mathematical equations based on this request:
        "${prompt}"
        Return ONLY the equations, separated by semicolons (;).
        Each equation must be in LaTeX format, ensuring full compatibility with Desmos.
        Restrict equations to only those explicitly requested; do not generate extra objects or variants.
        No explanations, descriptions, or additional text—only the equations.
        Equations should be formatted correctly for direct input into Desmos.
        Examples of valid responses:
        y=x^2; y=\\sin(x); y=3x+1
        f(x)=\\sqrt{x}; g(x)=\\frac{1}{x}; h(x)=e^x
        y=-0.4\\{-0.6<x<0.6\\}; y=\\cos(x)\\{-1<x<1\\}
    `

    // Call the Gemini API

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: enhancedPrompt,
      });
      console.log(response.text);

    const data = await response.text


    // Call the Deepseek API

    // const response = await ollama.chat({
    // model: 'deepseek-r1',
    // messages: [{ role: 'user', content: enhancedPrompt }],
    // })
    // console.log(response.message.content)
    // const data = await response.message.content


    // Parse the response to extract equations
    const rawText = data || ""

    // Clean up the response and split by semicolons
    const equations = rawText
      .replace(/```/g, "") // Remove code blocks if present
      .split(";")
      .map((eq: string) => eq.trim())
      .filter((eq: string) => eq.length > 0)

    return NextResponse.json({ equations })
  } catch (error) {
    console.error("Error in generate API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

