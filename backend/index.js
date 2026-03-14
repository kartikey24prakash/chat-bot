import express from "express"
import cors from "cors"
import "dotenv/config"

import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage } from "@langchain/core/messages"
import { tool, createAgent } from "langchain"
import * as z from "zod"

import { sendEmail } from "./mail.service.js"
import { tavilySearch } from "./tavily.js"

const app = express()
app.use(cors())
app.use(express.json())

// ---------------- LLM ----------------
const model = new ChatMistralAI({
  model: "mistral-small-latest",
})


// ---------------- TOOLS ----------------
const emailTool = tool(
  sendEmail,
  {
    name: "emailTool",
    description: "Send an email to a recipient",
    schema: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      html: z.string().describe("HTML email content"),
    })
  }
)

const tavilyTool = tool(
  tavilySearch,
  {
    name: "tavilySearch",
    description: "Search the internet for current information or news",
    schema: z.object({
      question: z.string().describe("Search query")
    })
  }
)


// ---------------- AGENT ----------------
const agent = createAgent({
  model,
  tools: [emailTool, tavilyTool],
  systemPrompt: `
You are an AI assistant with tools.

Rules:
- Use tavilySearch if the user asks about current events, news, or facts.
- Use emailTool if the user asks to send an email.
- You may use multiple tools if required.
`
})


// ---------------- MEMORY ----------------
let messages = []


// ---------------- ROUTE ----------------
app.post("/chat", async (req, res) => {
  try {

    const { message } = req.body

    messages.push(new HumanMessage(message))

    const response = await agent.invoke({
      messages
    })

    const lastMessage =
      response.messages[response.messages.length - 1]

    messages.push(lastMessage)

    res.json({
      reply: lastMessage.content
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ---------------- HEALTH ----------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})


app.listen(5000, () => {
  console.log("Server running on port 5000")
})