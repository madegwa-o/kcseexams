"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

// Define types for Server-Sent Events data
type SSEData =
    | { type: "status"; message: string }
    | { type: "content"; content: string; isComplete: boolean }
    | { type: "complete" }
    | { type: "error"; error: string };

export default function Chat() {
    const [messages, setMessages] = useState<Msg[]>([
        { role: "assistant", content: "Hello! I'm your kcse Tutor. I can help you with exam questions and academic content. Ask me about courses, units, or specific exam questions!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    // Enhanced formatResponse function with image URL handling
    const formatResponse = (text: string) => {
        if (!text) return '';

        return text
            // Clean up extra whitespace first
            .trim()
            // Fix malformed bold patterns first (like ****Question:**** -> **Question:**)
            .replace(/\*{3,}(.*?)\*{3,}/g, '**$1**')
            // Fix standalone ** that aren't part of bold formatting
            .replace(/\*\*\s*\*\*/g, '')
            // Handle cases where ** appears at start/end of lines incorrectly
            .replace(/^\*\*\s*$/gm, '')
            .replace(/\s+\*\*\s*$/gm, '')

            // Format image URLs - convert markdown-style image links to HTML img tags
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" loading="lazy" /></div>')

            // Format plain image URLs that appear in text
            .replace(/(?:^|\s)(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi, '<div class="my-4"><img src="$1" alt="Question Image" class="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" loading="lazy" /></div>')

            // Format image URL references in structured format (e.g., "Image: https://...")
            .replace(/(?:^|\n)\s*(?:Image|Question Image|Diagram):\s*(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi,
                '<div class="my-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"><p class="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">Question Image:</p><img src="$1" alt="Question Image" class="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" loading="lazy" /></div>')

            // Format headers and important sections (handle existing ** properly)
            .replace(/\*\*(Question:|Steps to solve:|Final Answer:|Solution:|Answer:|Example:|Note:|Important:|Summary:|Unit:|Year:|Course:|Image:|Diagram:)\*\*/gi, '\n\n**$1**')
            .replace(/(^|\n)(Question:|Steps to solve:|Final Answer:|Solution:|Answer:|Example:|Note:|Important:|Summary:|Unit:|Year:|Course:|Image:|Diagram:)(\s)/gi, '$1\n**$2**$3')

            // Format numbered lists (preserve existing numbering)
            .replace(/^(\d+\.\s+)/gm, '\n$1')
            // Format bullet points
            .replace(/^[-•*]\s+/gm, '\n• ')
            // Format course information specifically
            .replace(/(\d+\.\s+\*\*.*?\*\*)/g, '\n$1')
            // Add spacing before "Would you like" or similar continuation phrases
            .replace(/(Would you like|Can you|Do you want|Try|Let me know|Feel free|If you)/gi, '\n\n$1')
            // Clean up bold formatting - handle nested or malformed ** patterns
            .replace(/\*\*\s*\*\*([^*]+?)\*\*\s*\*\*/g, '**$1**')
            // Format bold text (**text** -> <strong>text</strong>) - be more precise
            .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
            // Clean up any remaining standalone **
            .replace(/\*\*(?!\S)|(?<!\S)\*\*/g, '')
            // Format italic text (*text* -> <em>text</em>) - avoid conflicts with **
            .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')

            // Format mathematical expressions
            .replace(/\\\[(.*?)\\\]/g, '<div class="math-block bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg my-2 font-mono text-center border-l-4 border-blue-400">$1</div>')
            .replace(/\\\((.*?)\\\)/g, '<span class="math-inline bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-sm">$1</span>')
            // Format fractions
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="fraction bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">$1/$2</span>')

            // Format code blocks (```code```)
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>')
            // Format inline code (`code`)
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">$1</code>')

            // Convert multiple line breaks to proper spacing
            .replace(/\n{3,}/g, '\n\n')
            // Convert line breaks to <br> tags
            .replace(/\n/g, '<br>')

            // Format numbered lists with proper HTML structure
            .replace(/(<br>\d+\.\s+[^<]*?)(?=<br>\d+\.\s+|<br><br>|$)/g, (match) => {
                // Split by <br> and numbered items
                const parts = match.split(/<br>(?=\d+\.\s+)/).filter(item => item.trim());
                if (parts.length <= 1) return match; // Not a proper list

                let result = '<ol class="list-decimal ml-6 my-3 space-y-2">';
                parts.forEach(part => {
                    const cleanPart = part.replace(/<br>/g, ' ').replace(/^\d+\.\s*/, '').trim();
                    if (cleanPart) {
                        result += `<li class="pl-2">${cleanPart}</li>`;
                    }
                });
                result += '</ol>';
                return result;
            })

            // Format bullet points with proper HTML structure
            .replace(/(<br>•\s+[^<]*?)(?=<br>•\s+|<br><br>|$)/g, (match) => {
                const parts = match.split(/<br>(?=•\s+)/).filter(item => item.trim());
                if (parts.length <= 1) return match; // Not a proper list

                let result = '<ul class="list-disc ml-6 my-3 space-y-2">';
                parts.forEach(part => {
                    const cleanPart = part.replace(/<br>/g, ' ').replace(/^•\s*/, '').trim();
                    if (cleanPart) {
                        result += `<li class="pl-2">${cleanPart}</li>`;
                    }
                });
                result += '</ul>';
                return result;
            })

            // Add proper paragraph spacing
            .replace(/(<br><br>)/g, '</p><p class="mb-4">')
            // Wrap content in paragraphs (avoid wrapping lists, divs, pre, img containers)
            .replace(/^(?!<[uo]l|<div|<pre|<img)/, '<p class="mb-4">')
            .replace(/(?<!>)$/, '</p>')
            // Clean up empty paragraphs
            .replace(/<p[^>]*><\/p>/g, '')
            .replace(/<p[^>]*>\s*<\/p>/g, '')
            // Fix any double paragraph issues
            .replace(/<\/p><p[^>]*>/g, '</p><p class="mb-4">')

            // Final cleanup - remove any remaining ** that might have been missed
            .replace(/\*\*/g, '');
    };

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const nextMsgs = [...messages, { role: "user" as const, content: text }];
        setMessages(nextMsgs);
        setInput("");
        setLoading(true);
        setStreamingContent("");
        setStatusMessage("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: nextMsgs })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No response body reader available");
            }

            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6)) as SSEData;

                            switch (data.type) {
                                case "status":
                                    setStatusMessage(data.message);
                                    break;

                                case "content":
                                    accumulatedContent += data.content;
                                    setStreamingContent(accumulatedContent);

                                    if (data.isComplete) {
                                        // Add the complete message to the messages array
                                        setMessages(m => [...m, { role: "assistant", content: accumulatedContent }]);
                                        setStreamingContent("");
                                        setStatusMessage("");
                                    }
                                    break;

                                case "complete":
                                    setLoading(false);
                                    setStatusMessage("");
                                    break;

                                case "error":
                                    throw new Error(data.error);
                            }
                        } catch (parseError) {
                            console.warn("Failed to parse SSE data:", parseError);
                        }
                    }
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Request failed.";
            setMessages(m => [...m, { role: "assistant", content: `Error: ${message}` }]);
            setStreamingContent("");
            setStatusMessage("");
        } finally {
            setLoading(false);
        }
    };

    // Component to render formatted message content
    const MessageContent = ({ content, isStreaming = false }: { content: string; isStreaming?: boolean }) => {
        const formattedContent = formatResponse(content);

        return (
            <div
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-em:text-inherit prose-code:text-inherit prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
        );
    };

    return (
        <main className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="w-full max-w-4xl mx-auto flex-1 min-h-0 rounded flex flex-col">
                {/* Messages container */}
                <div
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                    style={{
                        msOverflowStyle: 'none',  /* IE and Edge */
                        scrollbarWidth: 'none',   /* Firefox */
                    }}
                >
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none; /* Chrome, Safari, Opera */
                        }
                    `}</style>

                    {messages.map((m, idx) => (
                        <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                            <div className={
                                "inline-block rounded-lg px-4 py-3 max-w-[85%] text-left " +
                                (m.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                                )
                            }>
                                {m.role === "assistant" ? (
                                    <MessageContent content={m.content} />
                                ) : (
                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Status message */}
                    {statusMessage && (
                        <div className="text-left">
                            <div className="inline-block rounded-lg px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm italic border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    {statusMessage}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Streaming content */}
                    {streamingContent && (
                        <div className="text-left">
                            <div className="inline-block rounded-lg px-4 py-3 max-w-[85%] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-left">
                                <MessageContent content={streamingContent} isStreaming={true} />
                                <span className="animate-pulse text-blue-500 ml-1">▋</span>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && !streamingContent && !statusMessage && (
                        <div className="text-left">
                            <div className="inline-block rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input container */}
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
                    <div className="flex gap-2 max-w-4xl mx-auto">
                        <input
                            className="flex-1 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-150"
                            placeholder="Ask about courses, units, or exam questions..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                            disabled={loading}
                        />
                        <button
                            className="px-3 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
                            onClick={send}
                            disabled={loading || !input.trim()}
                        >
                            {loading ? (
                                <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
                                    <div className="w-3 h-3 border border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <span className="min-w-[32px] inline-block text-center">Send</span>
                            )}
                        </button>
                    </div>
                    {/* Character counter for long inputs */}
                    {input.length > 100 && (
                        <div className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-right max-w-4xl mx-auto">
                            {input.length}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}