import { ChatOpenAI } from "@langchain/openai";
import { examTools } from "./tools/exam-tools";

export function createModel() {
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL ?? "gpt-4o-mini", // fast, good for tool calling
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2
  }).bindTools(examTools);
  return model;
}


