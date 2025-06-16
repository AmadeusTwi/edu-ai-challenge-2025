# Service Analyzer AI (Node.js Version)

An intelligent service analysis tool powered by OpenAI and the Vercel AI SDK. This application provides comprehensive, structured reports about digital services, SaaS platforms, and technology companies through an interactive command-line interface.

## Key Features

- **Dual Input Modes**: Analyze services by name (e.g., "Notion") or by providing detailed descriptions of new/unknown services
- **Structured Reports**: Generates comprehensive Markdown reports with consistent formatting across 10 key analysis areas
- **Interactive CLI**: User-friendly command-line interface with continuous input capability
- **Powered by Vercel AI SDK**: Leverages the latest AI SDK for optimal performance and reliability
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux

## Prerequisites

- **Node.js**: Version 18 or higher ([Download here](https://nodejs.org/))
- **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd service-analyzer-js
   ```

2. **Navigate into the project directory**:
   ```bash
   cd service-analyzer-js
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure your API key**:
   - Create a `.env` file in the project root directory
   - Add your OpenAI API key to the file:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```
   - Replace `your_actual_api_key_here` with your actual OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Note**: The `.env` file is already listed in `.gitignore` to keep your API key secure

## How to Run

1. **Start the application**:
   ```bash
   node index.js
   ```
   
   Or use the npm script:
   ```bash
   npm start
   ```

2. **Use the application**:
   ```
   🔍 Service Analyzer AI
   ══════════════════════════════════════════════════
   Enter a service name or description to analyze.
   Type 'exit' to quit.

   > Notion
   ```

3. **Example Usage**:
   - **Service by name**: Type `Notion`, `Figma`, `Slack`, etc.
   - **Service by description**: Provide detailed information about a new or lesser-known service
   - **Exit**: Type `exit` to quit the application

## Sample Analysis Report Structure

Each generated report includes the following sections:

1. **Brief History** - Founding story and key milestones
2. **Core Features and Functionality** - Main capabilities and features
3. **Target Market and User Base** - Primary audience and demographics
4. **Business Model and Revenue Streams** - How the service generates revenue
5. **Technology Stack and Architecture** - Technical foundation and approach
6. **Competitive Landscape** - Main competitors and market positioning
7. **Recent Developments and Updates** - Latest news and product updates
8. **Market Position and Growth** - Current standing and growth trends
9. **Strengths and Advantages** - Key competitive advantages
10. **Perceived Weaknesses** - Potential challenges and limitations

## Dependencies

- **ai**: Vercel AI SDK for streamlined AI integration
- **@ai-sdk/openai**: OpenAI provider for the Vercel AI SDK
- **dotenv**: Environment variable management

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in the `.env` file
- **Network Errors**: Check your internet connection and API key validity
- **Module Errors**: Make sure all dependencies are installed with `npm install`

## License

MIT License - feel free to use and modify as needed.

---

**Need help?** Check the `sample_outputs.md` file for example inputs and outputs to better understand the application's capabilities. 