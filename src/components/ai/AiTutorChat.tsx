import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, RefreshCw, MessageSquare, Lightbulb, Code2, AlertTriangle, User, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askAiTutor } from '../../services/aiService';

export interface AiTutorChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialError?: string;
  activeDatabase?: string;
  currentProblemTitle?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mode?: string;
}

export const AiTutorChat: React.FC<AiTutorChatProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialError = '',
  activeDatabase = 'university_db',
  currentProblemTitle = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 Hello! I am your **Gemini AI SQL Tutor** on **RUPA's Query**.\n\nI can explain SQL concepts, debug syntax errors, guide you through challenging problems with progressive hints, optimize queries, and conduct mock SQL interviews.\n\nHow can I assist your database learning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<'concept' | 'hint' | 'review' | 'debug' | 'interview'>('concept');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto handle error passed from playground / practice
  useEffect(() => {
    if (initialError && isOpen) {
      setActiveMode('debug');
      setInputPrompt(`I encountered this SQL error while executing my query: "${initialError}". Can you explain why it happened and how to fix it?`);
    }
  }, [initialError, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || isLoading) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await askAiTutor({
        prompt: promptToSend,
        mode: activeMode,
        context: {
          currentQuery: initialQuery,
          databaseName: activeDatabase,
          problemTitle: currentProblemTitle,
          errorMessage: initialError,
        },
      });

      const aiMessage: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text: `Sorry, I encountered an issue connecting to the AI service: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `✨ Chat cleared. Ready for your next SQL question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPills = [
    { label: 'Explain WHERE vs HAVING', prompt: 'What is the exact functional difference between WHERE and HAVING in SQL?', mode: 'concept' as const },
    { label: 'Give me a hint for this problem', prompt: 'Can you give me a subtle hint to solve this problem without spoiling the full solution?', mode: 'hint' as const },
    { label: 'Review my SQL query', prompt: 'Review my SQL query for syntax correctness, edge cases, and performance.', mode: 'review' as const },
    { label: 'Explain Window Functions', prompt: 'Can you clearly explain DENSE_RANK() vs RANK() with a concise table example?', mode: 'concept' as const },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gemini AI SQL Tutor</h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Interactive guidance by Ambadipudi Rupavani</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Selector Chips */}
      <div className="px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'concept', label: 'Explain', icon: Lightbulb },
          { id: 'hint', label: 'Hint', icon: Sparkles },
          { id: 'review', label: 'Review', icon: Code2 },
          { id: 'debug', label: 'Debug', icon: AlertTriangle },
          { id: 'interview', label: 'Interview', icon: MessageSquare },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as any)}
              className={`px-2.5 py-1 rounded-full font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs'
              }`}
            >
              {msg.sender === 'ai' ? (
                <div className="space-y-2 markdown-content">
                  <div className="prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[10px] text-sky-200 text-right mt-1">{msg.timestamp}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl w-fit">
            <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Gemini is thinking and writing SQL guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveMode(pill.mode);
              handleSend(pill.prompt);
            }}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] whitespace-nowrap transition-colors"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask in ${activeMode.toUpperCase()} mode (e.g. why did this fail?)...`}
            className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
