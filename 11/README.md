# Audio Processing CLI

A command-line interface application that takes an audio file, transcribes it using OpenAI's Whisper model, summarizes the content, and provides detailed analytics including topic extraction and speaking metrics.

## Features

- 🎵 **Audio Transcription**: Uses OpenAI's Whisper-1 model for accurate audio-to-text conversion
- 📝 **Text Summarization**: Generates concise summaries highlighting key points and action items
- 🏷️ **Topic Extraction**: Identifies frequently mentioned topics with mention counts
- 📊 **Analytics**: Calculates word count and speaking speed (WPM)
- 💾 **File Output**: Saves transcription, summary, and analysis to timestamped files
- 🔧 **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **FFmpeg** (for audio file processing)
- **OpenAI API Key** (for Whisper and GPT models)

### Installing FFmpeg

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Windows (using Chocolatey):**
```bash
choco install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Setup

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd 11
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the project root and add your OpenAI API key:
   ```bash
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```
   
   **Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

4. **Get your OpenAI API key:**
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key to your `.env` file

## Usage

### Basic Usage

```bash
node index.js <path-to-audio-file>
```

### Examples

```bash
# Process an MP3 file
node index.js ./my-meeting.mp3

# Process a WAV file with absolute path
node index.js /Users/username/Documents/interview.wav

# Process an M4A file
node index.js ./recording.m4a
```

### Supported Audio Formats

The application supports various audio formats including:
- MP3
- WAV
- M4A
- FLAC
- OGG
- And many others supported by FFmpeg

### Command Line Help

```bash
node index.js --help
```

## Output Files

The application generates three files for each processing run:

### 1. Transcription File
- **Format**: `transcription.md`
- **Content**: Complete transcription of the audio file

### 2. Summary File
- **Format**: `summary.md`
- **Content**: Concise summary focusing on main points and action items

### 3. Analysis File
- **Format**: `analysis.json`
- **Content**: JSON object with analytics data

#### Analysis JSON Structure

```json
{
  "word_count": 1250,
  "speaking_speed_wpm": 150,
  "frequently_mentioned_topics": [
    {
      "topic": "Q4 Roadmap",
      "mentions": 4
    },
    {
      "topic": "Budget Planning",
      "mentions": 3
    }
  ]
}
```

## Example Output

```
Processing audio file: ./meeting.mp3
==================================================
Getting audio duration...
Audio duration: 300 seconds (5 minutes)
Starting audio transcription...
Transcription completed successfully
Transcription saved to: transcription.md
Generating summary...
Summary generated successfully
Summary saved to: summary.md
Extracting topics...
Topics extracted successfully
Analysis saved to: analysis.json

==================================================
PROCESSING COMPLETE
==================================================

📝 SUMMARY:
--------------------
The meeting focused on Q4 planning and budget allocation. Key decisions included increasing the marketing budget by 20% and postponing the product launch to Q1 2024. Action items include finalizing the budget proposal by Friday and scheduling follow-up meetings with stakeholders.

📊 ANALYTICS:
--------------------
{
  "word_count": 1250,
  "speaking_speed_wpm": 150,
  "frequently_mentioned_topics": [
    {
      "topic": "Q4 Planning",
      "mentions": 8
    },
    {
      "topic": "Budget Allocation",
      "mentions": 5
    },
    {
      "topic": "Product Launch",
      "mentions": 4
    }
  ]
}

📁 Generated Files:
  • transcription.md
  • summary.md
  • analysis.json
```

## Error Handling

The application includes comprehensive error handling for common issues:

- **Missing audio file**: Validates file exists before processing
- **Invalid API key**: Checks for OpenAI API key in environment variables
- **Audio processing errors**: Handles FFmpeg and audio format issues
- **API failures**: Gracefully handles OpenAI API errors with descriptive messages
- **File system errors**: Handles file read/write permission issues

## Dependencies

- `openai`: Official OpenAI API client
- `dotenv`: Environment variable management
- `yargs`: Command-line argument parsing
- `fluent-ffmpeg`: Audio file processing and metadata extraction

## API Usage and Costs

This application uses the following OpenAI APIs:
- **Whisper API**: For audio transcription (~$0.006 per minute of audio)
- **GPT-3.5-turbo**: For text summarization and topic extraction

Please monitor your OpenAI API usage and costs through the [OpenAI Dashboard](https://platform.openai.com/usage).

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed on your system
   - Verify it's in your system PATH by running `ffmpeg -version`

2. **Invalid API key error**
   - Double-check your OpenAI API key in the `.env` file
   - Ensure there are no extra spaces or characters

3. **Audio file not supported**
   - Try converting your audio file to MP3 or WAV format
   - Ensure the file is not corrupted

4. **Permission denied errors**
   - Check file permissions for the audio file and output directory
   - Run with appropriate permissions if needed

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository or contact the maintainers. 