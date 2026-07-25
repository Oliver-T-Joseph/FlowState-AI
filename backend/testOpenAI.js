console.log("Starting OpenAI test...");

require("dotenv").config();

const OpenAI = require("openai");

console.log(
  "API key loaded:",
  Boolean(process.env.OPENAI_API_KEY)
);

console.log(
  "Model:",
  process.env.OPENAI_MODEL || "gpt-5-mini"
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY was not found. Check the backend/.env file."
    );
  }

  console.log("Sending request to OpenAI...");

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: "Reply with exactly: The AI connection works.",
  });

  console.log("AI response:");
  console.log(response.output_text);
}

// This line is required—it actually starts the function.
testOpenAI().catch((error) => {
  console.error("OpenAI test failed.");
  console.error("Status:", error.status || "Unknown");
  console.error("Code:", error.code || "Unknown");
  console.error("Message:", error.message);
});