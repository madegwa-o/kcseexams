import { NextRequest } from "next/server";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, BaseMessage } from "@langchain/core/messages";
import { examTools } from "@/lib/tools/exam-tools";
import type { DynamicStructuredTool } from "langchain/tools";
import type { ZodTypeAny } from "zod";
import { createModel } from "@/lib/ai";

type ChatPayload = {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
};

// Define proper types for streaming responses
type StreamingMessage =
    | { type: "status"; message: string }
    | { type: "content"; content: string; isComplete: boolean }
    | { type: "complete" }
    | { type: "error"; error: string };

// Type for tool invocation arguments
type ToolInvocationArgs = Record<string, unknown>;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatPayload;

    const system = new SystemMessage(
        `You are a KCSE Exam Assistant, an intelligent academic helper specialized in Kenya Certificate of Secondary Education (KCSE) past papers and exam preparation.

                Your capabilities include:
                1) Listing all available KCSE subjects
                2) Finding exam questions by subject, year, paper, topic, difficulty, or form level
                3) Searching for specific questions or topics across subjects
                4) Providing complete answers and detailed solutions to exam questions
                5) Giving subject overviews and statistics
                6) Helping students understand KCSE exam patterns and requirements
                7) Displaying question images and diagrams when available
                
                Key Guidelines:
                - Always use the provided tools to fetch information from the KCSE database before answering
                - Provide accurate, well-structured responses with proper formatting
                - When showing questions, include relevant context (year, paper, marks, difficulty)
                - For questions with images, always include the image URL in your response using proper markdown format: ![Question Image](image_url)
                - When displaying complete questions, mention if images are available and include them
                - For complete solutions, show step-by-step working where available
                - If asked about non-KCSE content, politely redirect to KCSE-related topics
                - Help students understand concepts, not just memorize answers
                - Encourage good study practices and exam preparation strategies
                - When questions have diagrams or images, acknowledge their importance for understanding the question
                
                Image Handling:
                - When a question has an image_url, always display it using markdown image syntax
                - Use descriptive alt text like "Question Image", "Diagram", or "Figure" for accessibility
                - Mention when images contain important information for solving the question
                - For questions with images, encourage students to view the image for full understanding
                
                Subject Coverage: Mathematics, English, Kiswahili, Chemistry, Physics, Biology, History, Geography, CRE, IRE, Agriculture, Business Studies, Computer Studies, and more.
                
                Response Format:
                - Use clear headings and structure for better readability
                - Include images when available using markdown syntax
                - Provide context about difficulty level and marks
                - Show step-by-step solutions when available
                - Use bullet points for multiple parts or options
                
                Always prioritize accuracy and educational value in your responses.`
    );

    const messageObjects = [system, ...body.messages.map(m => {
      if (m.role === "user") return new HumanMessage(m.content);
      if (m.role === "assistant") return new AIMessage(m.content);
      return new SystemMessage(m.content);
    })];

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendMessage = (data: StreamingMessage) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const model = createModel();
          const conversation: BaseMessage[] = [...messageObjects];

          // Send initial status
          sendMessage({ type: "status", message: "Searching KCSE database..." });

          let aiMessage: AIMessage = await model.invoke(conversation) as AIMessage;

          type ToolLike = Pick<DynamicStructuredTool<ZodTypeAny, unknown, unknown, string>, "name" | "invoke">;
          const toolMap: Record<string, ToolLike> = {};
          examTools.forEach(tool => {
            toolMap[tool.name] = tool;
          });

          // Handle tool calls with more specific status messages
          for (let i = 0; i < 5; i++) { // Increased iterations for complex queries
            const toolCalls = (aiMessage as AIMessage).tool_calls ?? [];
            if (!toolCalls.length) break;

            // Send tool-specific status messages
            for (const call of toolCalls) {
              let statusMessage = "Processing your request...";

              switch (call.name) {
                case "list_subjects":
                  statusMessage = "Loading available KCSE subjects...";
                  break;
                case "get_subject_overview":
                  statusMessage = "Gathering subject statistics...";
                  break;
                case "search_questions":
                  statusMessage = "Searching through exam questions...";
                  break;
                case "get_questions_by_subject":
                  statusMessage = "Fetching questions for subject...";
                  break;
                case "get_questions_by_year":
                  statusMessage = "Loading questions by year...";
                  break;
                case "get_questions_by_paper":
                  statusMessage = "Retrieving paper questions...";
                  break;
                case "get_questions_by_topic":
                  statusMessage = "Finding topic-specific questions...";
                  break;
                case "get_complete_question":
                  statusMessage = "Loading complete question with solution...";
                  break;
                default:
                  statusMessage = "Fetching exam data...";
              }

              sendMessage({ type: "status", message: statusMessage });
            }

            const toolMessages: ToolMessage[] = [];
            for (const call of toolCalls) {
              const tool = toolMap[call.name];
              if (!tool) continue;

              try {
                const args: ToolInvocationArgs = call.args ?? {};
                const result = await tool.invoke(args);
                toolMessages.push(new ToolMessage({
                  content: typeof result === "string" ? result : JSON.stringify(result),
                  name: call.name,
                  tool_call_id: String(call.id)
                }));
              } catch (error) {
                console.error(`Error executing tool ${call.name}:`, error);
                toolMessages.push(new ToolMessage({
                  content: JSON.stringify({ error: `Failed to execute ${call.name}` }),
                  name: call.name,
                  tool_call_id: String(call.id)
                }));
              }
            }

            conversation.push(aiMessage, ...toolMessages);

            // Send status for AI processing
            sendMessage({ type: "status", message: "Analyzing results and preparing response..." });

            aiMessage = await model.invoke(conversation) as AIMessage;
          }

          // Stream the final response
          const finalText = typeof aiMessage.content === "string" && aiMessage.content.length > 0
              ? aiMessage.content
              : "I've gathered the KCSE exam information. If you need more specific details or have additional questions, please let me know!";

          // Send the response in chunks for streaming effect
          const sentences = finalText.split(/(?<=[.!?])\s+/);
          for (let i = 0; i < sentences.length; i++) {
            const chunk = i === 0 ? sentences[i] : ' ' + sentences[i];
            sendMessage({
              type: "content",
              content: chunk,
              isComplete: i === sentences.length - 1
            });

            // Small delay for streaming effect
            await new Promise<void>(resolve => setTimeout(resolve, 100));
          }

          // Send completion signal
          sendMessage({ type: "complete" });

        } catch (error) {
          console.error("Chat API error:", error);
          const message = error instanceof Error ? error.message : "Unknown error occurred";
          sendMessage({ type: "error", error: message });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (err: unknown) {
    console.error("POST handler error:", err);
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}