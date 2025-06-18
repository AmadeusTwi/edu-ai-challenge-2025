import "dotenv/config";
import fs from "fs";
import readline from "readline";
import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Error: OPENAI_API_KEY is not set in .env");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

// Load products
const productsRaw = fs.readFileSync("./products.json", "utf-8");
const allProducts = JSON.parse(productsRaw);

// Define function schema for OpenAI
const displayFilteredProductsTool = {
  type: "function",
  function: {
    name: "display_filtered_products",
    description:
      "Displays a list of products that match the user's specified criteria.",
    parameters: {
      type: "object",
      properties: {
        filtered_products: {
          type: "array",
          description: "The list of products matching the user's query.",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              category: { type: "string" },
              price: { type: "number" },
              rating: { type: "number" },
              in_stock: { type: "boolean" },
            },
            required: ["name", "category", "price", "rating", "in_stock"],
          },
        },
      },
      required: ["filtered_products"],
    },
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  while (true) {
    await new Promise((resolve) => {
      rl.question("What are you looking for today? ", async (userInput) => {
        if (!userInput.trim()) {
          console.log("Goodbye!");
          rl.close();
          process.exit(0);
        }
        try {
          const messages = [
            {
              role: "system",
              content: `You are a helpful assistant. You will be given a list of products in JSON format and a user query. Your task is to filter this list based on the user's query and call the provided function with only the matching products.`,
            },
            {
              role: "user",
              content: `Here is the list of available products: ${JSON.stringify(
                allProducts
              )}. Now, please find me ${userInput}`,
            },
          ];

          const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages,
            tools: [displayFilteredProductsTool],
            tool_choice: {
              type: "function",
              function: { name: "display_filtered_products" },
            },
          });

          const choice = response.choices[0];

          if (choice.message.tool_calls) {
            const toolCall = choice.message.tool_calls.find(
              (tc) => tc.function.name === "display_filtered_products"
            );
            if (toolCall) {
              const args = JSON.parse(toolCall.function.arguments);
              const filtered = args.filtered_products;
              if (Array.isArray(filtered) && filtered.length > 0) {
                console.log("\nProducts found:");
                filtered.forEach((p, i) => {
                  console.log(`\n#${i + 1}`);
                  console.log(`Name: ${p.name}`);
                  console.log(`Category: ${p.category}`);
                  console.log(`Price: $${p.price}`);
                  console.log(`Rating: ${p.rating}`);
                  console.log(`In Stock: ${p.in_stock ? "Yes" : "No"}`);
                });
              } else {
                console.log("No products found matching your criteria.");
              }
            } else {
              console.log("No products found matching your criteria.");
            }
          } else {
            console.log("No products found matching your criteria.");
          }
        } catch (err) {
          console.error("Error communicating with OpenAI:", err.message);
        }
        resolve();
      });
    });
  }
}

main();
