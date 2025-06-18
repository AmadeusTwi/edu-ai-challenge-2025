# Product Search CLI

A CLI tool that uses OpenAI function calling to search and filter products from a database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   # .env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Get your OpenAI API key:**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Add it to your `.env` file

## Usage

Run the application:
```bash
node index.js
```

Then enter search queries when prompted:

### Example Searches:
- `All clothing in stock`
- `Electronics under $100`
- `Fitness equipment`
- `Kitchen appliances in stock`
- `Books`

## Database

The app includes 50 products across 5 categories:
- **Clothing** (10 items)
- **Electronics** (10 items)
- **Fitness** (10 items)
- **Kitchen** (10 items)
- **Books** (10 items)

## Exit

Press Enter without typing anything to exit the application. 