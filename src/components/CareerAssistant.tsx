import React, { useState, useRef, useEffect } from "react";
import { ResumeData } from "../types/resume";
import { AIService } from "../services/ai";
import { MessageSquare, Send, X, Bot, Sparkles, User, HelpCircle, ArrowRight } from "lucide-react";

interface CareerAssistantProps {
  resumeData: ResumeData;
  selectedModel: "gemini" | "openai" | "mock";
  apiKey: string;
  onNavigate?: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const CareerAssistant: React.FC<CareerAssistantProps> = ({
  resumeData,
  selectedModel,
  apiKey,
  onNavigate,
  isOpen,
  setIsOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI Career Assistant. I have analyzed your resume for "${resumeData.personalInfo.title || "your target role"}". \n\nHow can I help you accelerate your job search today?`,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Build conversation history
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await AIService.careerAssistantChat(
        resumeData,
        textToSend,
        history,
        { apiKey, provider: selectedModel }
      );

      const navigateRegex = /\[NAVIGATE:(\w+)\]/;
      const match = reply.match(navigateRegex);
      let cleanReply = reply;

      if (match) {
        const section = match[1];
        cleanReply = reply.replace(navigateRegex, "").trim();
        if (onNavigate) {
          onNavigate(section);
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: cleanReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an issue querying the model. Please verify your connection status and API keys.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action triggers
  const handleQuickAction = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Floating Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="no-print fixed bottom-6 right-6 z-40 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-semibold text-sm group glow-pulse"
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap text-xs uppercase tracking-wider">
          Ask Career Coach
        </span>
      </button>

      {/* Slide-out Chat Drawer */}
      <div
        className={`no-print fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-zinc-950 border-l border-zinc-800 shadow-2xl transform transition-transform duration-355 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-650/15 flex items-center justify-center border border-violet-500/20">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">AI Career Assistant</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Powered by Google Gemini</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-tr-none font-medium"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                } whitespace-pre-wrap`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-violet-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-none p-3 text-xs text-zinc-500 italic flex items-center gap-1.5">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
                Formulating career recommendations...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="p-4 bg-zinc-900/30 border-t border-zinc-900 space-y-2">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Quick Suggestions
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => handleQuickAction("How can I improve my resume?")}
                className="w-full text-left p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-violet-550/40 rounded-lg text-[11px] text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between"
              >
                <span>"How can I improve my resume?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <button
                onClick={() => handleQuickAction("What skills should I learn to boost my profile?")}
                className="w-full text-left p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-violet-550/40 rounded-lg text-[11px] text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between"
              >
                <span>"What skills should I learn?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <button
                onClick={() => handleQuickAction("Am I suitable for a Senior Engineer job with this resume?")}
                className="w-full text-left p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 hover:border-violet-550/40 rounded-lg text-[11px] text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between"
              >
                <span>"Am I suitable for my target role?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-4 bg-zinc-900 border-t border-zinc-850 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question about your career path..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-violet-650 hover:bg-violet-750 disabled:bg-zinc-800 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:text-zinc-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};
