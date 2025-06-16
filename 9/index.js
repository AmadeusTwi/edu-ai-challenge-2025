import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { config } from "dotenv";
import { createInterface } from "readline/promises";
import { pathToFileURL } from "url";

// Load environment variables
config();

const SYSTEM_PROMPT = `You are an expert service analyst with deep knowledge of technology companies, SaaS platforms, and digital services. Your task is to provide comprehensive, well-researched analysis of services based on user input.

When a user provides a service name or description, generate a detailed Markdown report with the following structure:

# [Service Name] - Service Analysis Report

## Brief History
Provide founding year, key milestones, and evolution timeline of the service.

## Target Audience
Describe the primary user segments and demographics that the service serves.

## Core Features
List the top 2–4 key functionalities that define what the service does.

## Unique Selling Points
Identify the key differentiators that set this service apart from competitors.

## Business Model
Explain how the service makes money and generates revenue.

## Tech Stack Insights
Provide any available information or hints about the technologies and platforms used.

## Perceived Strengths
Highlight mentioned positives, standout features, and competitive advantages.

## Perceived Weaknesses
Identify cited drawbacks, limitations, or areas that need improvement.

Guidelines:
- Use factual, well-researched information
- Write in a professional, analytical tone
- Include specific details and metrics when available
- Structure information clearly with appropriate headers
- If analyzing a description rather than a known service, clearly state this and provide analysis based on the provided information
- For unknown or emerging services, note limitations in available information`;

async function main() {
  // Initialize OpenAI provider
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Set up command-line interface
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🔍 Service Analyzer AI");
  console.log("━".repeat(50));
  console.log("Enter a service name or description to analyze.");
  console.log("Type 'exit' to quit.\n");

  // Main input loop
  while (true) {
    try {
      const userInput = await rl.question("> ");

      // Check for exit command
      if (userInput.toLowerCase().trim() === "exit") {
        console.log("\nGoodbye! 👋");
        break;
      }

      // Skip empty input
      if (!userInput.trim()) {
        continue;
      }

      console.log("\n🤖 Analyzing service...\n");

      // Generate analysis using Vercel AI SDK
      const result = await generateText({
        model: openai("gpt-4.1-mini"),
        system: SYSTEM_PROMPT,
        prompt: userInput,
      });

      // Display the generated report
      console.log("═".repeat(80));
      console.log(result.text);
      console.log("═".repeat(80));
      console.log("\n");
    } catch (error) {
      console.error("❌ Error generating analysis:", error.message);
      console.log("Please check your API key and try again.\n");
    }
  }

  // Close the readline interface
  rl.close();
}

// Cross-platform entry point detection
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}
