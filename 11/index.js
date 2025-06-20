#!/usr/bin/env node

import { pathToFileURL } from "url";
import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import { OpenAI } from "openai";
// Load environment variables
dotenv.config();

// Configure command line arguments
const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 <audioFile>")
  .command(
    "$0 <audioFile>",
    "Process an audio file for transcription and analysis",
    (yargs) => {
      yargs.positional("audioFile", {
        describe: "Path to the audio file to process",
        type: "string",
      });
    }
  )
  .demandCommand(1, "You must provide an audio file path")
  .help().argv;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get audio file duration in seconds using ffmpeg
 */
async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get audio duration: ${err.message}`));
        return;
      }

      const duration = metadata.format.duration;
      if (!duration) {
        reject(new Error("Could not determine audio duration"));
        return;
      }

      resolve(duration);
    });
  });
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
async function transcribeAudio(filePath) {
  try {
    console.log("Starting audio transcription...");

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    console.log("Transcription completed successfully");
    return transcription.text;
  } catch (error) {
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Save transcription to a markdown file
 */
async function saveTranscription(transcriptionText) {
  const filename = "transcription.md";

  const content = `# Audio Transcription

Generated on: ${new Date().toLocaleString()}

## Transcription

${transcriptionText}
`;

  try {
    await fs.promises.writeFile(filename, content, "utf8");
    console.log(`Transcription saved to: ${filename}`);
    return filename;
  } catch (error) {
    throw new Error(`Failed to save transcription: ${error.message}`);
  }
}

/**
 * Summarize text using OpenAI GPT API
 */
async function summarizeText(transcriptionText) {
  try {
    console.log("Generating summary...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert assistant who creates concise, easy-to-read summaries of transcribed text. Focus on the main points, key decisions, and action items.",
        },
        {
          role: "user",
          content: transcriptionText,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content;
    console.log("Summary generated successfully");
    return summary;
  } catch (error) {
    throw new Error(`Summarization failed: ${error.message}`);
  }
}

/**
 * Extract frequently mentioned topics using OpenAI GPT API with JSON mode
 */
async function extractTopics(transcriptionText) {
  try {
    console.log("Extracting topics...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing text and identifying frequently mentioned topics. 
          
          Analyze the provided text and identify the most frequently mentioned topics or subjects. 
          
          Return your response as a JSON object with the following exact structure:
          {
            "frequently_mentioned_topics": [
              {"topic": "Topic Name 1", "mentions": 3},
              {"topic": "Topic Name 2", "mentions": 2}
            ]
          }
          
          Only include topics that are mentioned at least twice. Limit to the top 10 most frequent topics.`,
        },
        {
          role: "user",
          content: transcriptionText,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.1,
    });

    const topicsJson = JSON.parse(completion.choices[0].message.content);
    console.log("Topics extracted successfully");
    return topicsJson;
  } catch (error) {
    throw new Error(`Topic extraction failed: ${error.message}`);
  }
}

/**
 * Calculate word count from text
 */
function calculateWordCount(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Calculate speaking speed in words per minute
 */
function calculateSpeakingSpeed(wordCount, durationInSeconds) {
  const durationInMinutes = durationInSeconds / 60;
  if (durationInMinutes < 0.01) {
    // Avoid division by zero for very short audio
    return 0;
  }
  return Math.round(wordCount / durationInMinutes);
}

/**
 * Save summary to a markdown file
 */
async function saveSummary(summaryText) {
  const filename = "summary.md";

  const content = `# Audio Summary

Generated on: ${new Date().toLocaleString()}

## Summary

${summaryText}
`;

  try {
    await fs.promises.writeFile(filename, content, "utf8");
    console.log(`Summary saved to: ${filename}`);
    return filename;
  } catch (error) {
    throw new Error(`Failed to save summary: ${error.message}`);
  }
}

/**
 * Save analysis to a JSON file
 */
async function saveAnalysis(analysisData) {
  const filename = "analysis.json";

  try {
    await fs.promises.writeFile(
      filename,
      JSON.stringify(analysisData, null, 2),
      "utf8"
    );
    console.log(`Analysis saved to: ${filename}`);
    return filename;
  } catch (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}

/**
 * Main application function
 */
async function main() {
  try {
    const audioFilePath = argv.audioFile;

    // Validate audio file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required. Please check your .env file."
      );
    }

    console.log(`Processing audio file: ${audioFilePath}`);
    console.log("==================================================");

    // Get audio duration
    console.log("Getting audio duration...");
    const duration = await getAudioDuration(audioFilePath);
    console.log(
      `Audio duration: ${Math.round(duration)} seconds (${Math.round(
        duration / 60
      )} minutes)`
    );

    // Transcribe audio
    const transcription = await transcribeAudio(audioFilePath);

    // Save transcription
    const transcriptionFile = await saveTranscription(transcription);

    // Generate summary
    const summary = await summarizeText(transcription);

    // Save summary
    const summaryFile = await saveSummary(summary);

    // Extract topics
    const topicsData = await extractTopics(transcription);

    // Calculate metrics
    const wordCount = calculateWordCount(transcription);
    const speakingSpeed = calculateSpeakingSpeed(wordCount, duration);

    // Combine analytics
    const analytics = {
      word_count: wordCount,
      speaking_speed_wpm: speakingSpeed,
      ...topicsData,
    };

    // Save analysis
    const analysisFile = await saveAnalysis(analytics);

    // Display results
    console.log("\n==================================================");
    console.log("PROCESSING COMPLETE");
    console.log("==================================================");

    console.log("\n📝 SUMMARY:");
    console.log("--------------------");
    console.log(summary);

    console.log("\n📊 ANALYTICS:");
    console.log("--------------------");
    console.log(JSON.stringify(analytics, null, 2));

    console.log("\n📁 Generated Files:");
    console.log(`  • ${transcriptionFile}`);
    console.log(`  • ${summaryFile}`);
    console.log(`  • ${analysisFile}`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Entry point detection - cross-platform compatible
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
