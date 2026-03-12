// import "dotenv/config"
// import { ChatMistralAI } from "@langchain/mistralai"
// import readline from "readline/promises";
// import { HumanMessage } from "@langchain/core/messages";
// import chalk from "chalk";

// const messages = [];

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const model = new ChatMistralAI({
//   model: "mistral-small-latest",
// });

// console.log(chalk.cyan.bold("\n  Mistral AI Chat\n"));

// while (true) {
//   const userInput = await rl.question(chalk.green("You: "));

//   if (!userInput.trim()) continue;

//   messages.push(new HumanMessage(userInput));
//   const response = await model.invoke(messages);
//   messages.push(response);

//   console.log(chalk.cyan("Mistral: ") + response.content + "\n");
// }

import express from "express"
import cors from "cors"
import "dotenv/config"

import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage } from "@langchain/core/messages"

const app = express()
app.use(cors())
app.use(express.json())

const model = new ChatMistralAI({
  model: "mistral-small-latest",
})

let messages = []

app.post("/chat", async (req, res) => {
  try {

    const { message } = req.body

    messages.push(new HumanMessage(message))

    const response = await model.invoke(messages)

    messages.push(response)

    res.json({
      reply: response.content
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})