import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  FileText,
  Upload,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Activity,
  Copy,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  UploadedDocument,
  Citation,
  RagResponse,
  AccuracyEvalResult,
  getRagDocuments,
  uploadRagDocuments,
  deleteRagDocument,
  askRagAssistant,
  clearRagConversation,
  getRagHealth,
  runRagAccuracyEval,
} from '../../services/ragService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Citation[];
  status?: 'answered' | 'insufficient_evidence' | 'error';
  metadata?: any;
}

export const FloatingRagAssistant: React.FC = () => {
  // Floating visibility state (NEVER open automatically; strictly closed by default)
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'eval'>('chat');

  // Document management state
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state (conversation history preserved even when minimized/closed)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Welcome to RUPA's Query Document Intelligence Assistant!**\n\nI answer your questions with high precision and strict evidence grounding from your uploaded documents.\n\nUpload documents (**PDF, Word, Markdown, PowerPoint, Excel, CSV, JSON, HTML**) in the **Documents** tab, or ask questions right away!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Evaluation / Benchmark state
  const [evalResult, setEvalResult] = useState<AccuracyEvalResult | null>(null);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Fetch documents and pipeline health on open
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      loadHealth();
    }
  }, [isOpen]);

  // Periodic polling for document processing status if any doc is processing
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing');
    if (hasProcessing && isOpen) {
      const interval = setInterval(() => {
        loadDocuments();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [documents, isOpen]);

  // Scroll messages to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, activeTab]);

  const loadDocuments = async () => {
    try {
      setIsLoadingDocs(true);
      const docs = await getRagDocuments();
      setDocuments(docs);
    } catch (err) {
      console.warn('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const loadHealth = async () => {
    try {
      const h = await getRagHealth();
      setHealthStatus(h);
    } catch (err) {
      console.warn('Health check error:', err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      const res = await uploadRagDocuments(fileArray);
      if (res.documents) {
        setDocuments((prev) => [...res.documents, ...prev]);
      }
      setTimeout(loadDocuments, 1500);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string, name: string) => {
    try {
      await deleteRagDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDocFilter === docId) setSelectedDocFilter('all');
    } catch (err: any) {
      setUploadError(`Failed to delete "${name}": ${err.message}`);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const q = (customPrompt || inputQuery).trim();
    if (!q || isAsking) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAsking(true);

    try {
      const selectedDocIds = selectedDocFilter !== 'all' ? [selectedDocFilter] : [];
      const res: RagResponse = await askRagAssistant({
        question: q,
        selectedDocIds,
      });

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
        status: res.status,
        metadata: res.metadata,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Processing Error**: ${err.message || "Failed to process question from uploaded documents."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear conversation history?')) {
      await clearRagConversation();
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `✨ Chat history cleared. What document questions would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleRunEvaluation = async () => {
    setIsRunningEval(true);
    try {
      const res = await runRagAccuracyEval();
      setEvalResult(res);
    } catch (err: any) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setIsRunningEval(false);
    }
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'pptx':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'json':
      case 'html':
        return <FileCode className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const quickPills = [
    'Summarize uploaded document topics',
    'What database concepts are explained?',
    'Explain the differences between concepts across documents',
    'What tables or data rows are defined?',
  ];

  return (
    <>
      {/* 1. Floating Launcher Button (Fixed at Bottom-Right, ONLY opens on user click) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Document RAG Intelligence Assistant"
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-white/20"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold leading-tight tracking-wide">Document AI</span>
              <span className="block text-[10px] text-indigo-100 font-medium">LangGraph & Qdrant RAG</span>
            </div>
            {documents.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-black bg-emerald-500 text-white rounded-full border-2 border-white shadow-xs">
                {documents.filter((d) => d.status === 'ready').length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. Floating Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-14'
              : isMaximized
              ? 'inset-4 md:inset-8 w-auto h-auto'
              : 'bottom-6 right-6 w-[94vw] sm:w-[480px] md:w-[520px] h-[640px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs tracking-tight">Document RAG Assistant</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Accuracy-Focused
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {documents.filter((d) => d.status === 'ready').length} Active Docs • LangGraph Orchestrated
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* If minimized, hide body */}
          {!isMinimized && (
            <>
              {/* Tab Navigation */}
              <div className="px-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-2 font-semibold text-xs border-b-2 transition-all ${
                      activeTab === 'chat'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    💬 Q&A Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-3 py-2 font-semibold text-xs border-b-2 flex items-center gap-1.5 transition-all ${
                      activeTab === 'documents'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    📁 Documents
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {documents.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('eval')}
                    className={`px-3 py-2 font-semibold text-xs border-b-2 flex items-center gap-1 transition-all ${
                      activeTab === 'eval'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Accuracy Eval
                  </button>
                </div>

                {activeTab === 'chat' && (
                  <button
                    onClick={handleClearHistory}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Clear Conversation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* TAB 1: Q&A CHAT */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
                  {/* Document Scope Selector */}
                  <div className="px-3 py-1.5 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Search className="w-3 h-3 text-indigo-500" />
                      Scope:
                    </span>
                    <select
                      value={selectedDocFilter}
                      onChange={(e) => setSelectedDocFilter(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">All Uploaded Documents ({documents.length})</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name.length > 28 ? d.name.slice(0, 26) + '...' : d.name} ({d.fileType.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'assistant' && (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs'
                          }`}
                        >
                          {msg.sender === 'assistant' ? (
                            <div className="space-y-2.5">
                              {/* Markdown Answer */}
                              <div className="prose prose-xs dark:prose-invert max-w-none">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>

                              {/* Source Citations Accordion */}
                              {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                                  <button
                                    onClick={() => toggleCitation(msg.id)}
                                    className="flex items-center justify-between w-full text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5" />
                                      {msg.citations.length} Grounded Source Citation{msg.citations.length > 1 ? 's' : ''}
                                    </span>
                                    {expandedCitations[msg.id] ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  {expandedCitations[msg.id] && (
                                    <div className="mt-2 space-y-2">
                                      {msg.citations.map((cite, cIdx) => (
                                        <div
                                          key={cite.id || cIdx}
                                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/60 text-[11px] shadow-xs"
                                        >
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                                              📄 {cite.documentName}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                                              {cite.pageNumber
                                                ? `Page ${cite.pageNumber}`
                                                : cite.slideNumber
                                                ? `Slide ${cite.slideNumber}`
                                                : cite.sheetName
                                                ? `Sheet: ${cite.sheetName}`
                                                : cite.sectionHeading || 'Section'}
                                            </span>
                                          </div>
                                          <p className="text-slate-600 dark:text-slate-400 text-[10.5px] italic bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                                            "{cite.snippet}"
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Footer Actions */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-400">
                                <span>{msg.timestamp}</span>
                                <button
                                  onClick={() => handleCopy(msg.text, msg.id)}
                                  className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                                >
                                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === msg.id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <span className="block text-[10px] text-indigo-200 text-right mt-1">{msg.timestamp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isAsking && (
                      <div className="flex gap-2.5 items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl w-fit">
                        <Bot className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span>LangGraph RAG is retrieving evidence & verifying citations...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggestion Chips */}
                  {messages.length < 3 && (
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 shrink-0">
                      {quickPills.map((pill, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(pill)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10.5px] whitespace-nowrap transition-colors"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat Input */}
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder="Ask anything about your uploaded documents..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={isAsking || !inputQuery.trim()}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                        title="Send query"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: DOCUMENT UPLOAD & MANAGEMENT */}
              {activeTab === 'documents' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                  {/* Drag and Drop Upload Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className="p-6 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 text-center hover:bg-indigo-50/80 transition-all"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                      Drag & Drop documents here, or click to browse
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                      PDF, DOCX, TXT, MD, PPTX, XLSX, CSV, JSON, HTML (Max 25MB each)
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept=".pdf,.docx,.txt,.md,.pptx,.xlsx,.xls,.csv,.json,.html"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {isUploading ? 'Uploading & Parsing...' : 'Select Files to Upload'}
                    </button>

                    {uploadError && (
                      <p className="mt-2 text-xs text-rose-500 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {uploadError}
                      </p>
                    )}
                  </div>

                  {/* Uploaded Documents List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Uploaded Documents ({documents.length})
                      </h4>
                      <button
                        onClick={loadDocuments}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh
                      </button>
                    </div>

                    {isLoadingDocs && documents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Loading documents...</div>
                    ) : documents.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        No documents uploaded yet. Upload a document to start grounding answers!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0">
                                {getFormatIcon(doc.fileType)}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {doc.name}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  <span>•</span>
                                  <span className="uppercase font-semibold">{doc.fileType}</span>
                                  {doc.pageCount && <span>• {doc.pageCount} Pages</span>}
                                  {doc.slideCount && <span>• {doc.slideCount} Slides</span>}
                                  {doc.totalChunks > 0 && <span>• {doc.totalChunks} Chunks</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {doc.status === 'ready' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Ready
                                </span>
                              )}
                              {doc.status === 'processing' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse flex items-center gap-1">
                                  <Activity className="w-3 h-3 animate-spin" /> Processing
                                </span>
                              )}
                              {doc.status === 'error' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Error
                                </span>
                              )}

                              <button
                                onClick={() => handleDelete(doc.id, doc.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Delete document and purge vectors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ACCURACY EVALUATION BENCHMARK */}
              {activeTab === 'eval' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
                  {/* Pipeline Health Card */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      RAG Architecture & Pipeline Health
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 block">Vector Database</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {healthStatus?.qdrantCloudConnected ? 'Qdrant Cloud' : 'Qdrant / Local Hybrid'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 block">Indexed Vectors</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {healthStatus?.vectorStore?.totalVectors || 0} Chunks
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 block">Embedding Model</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Gemini Embeddings (768-dim)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 block">Workflow Engine</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          LangGraph 12-Node Flow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Benchmark Trigger Card */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs text-center">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                      Comprehensive Accuracy Benchmark
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Evaluates Precision@K, Recall, MRR, Faithfulness, Citation accuracy, and Abstention.
                    </p>
                    <button
                      onClick={handleRunEvaluation}
                      disabled={isRunningEval}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      {isRunningEval ? 'Running 9-Category Test Suite...' : 'Run Accuracy Evaluation'}
                    </button>
                  </div>

                  {/* Benchmark Results */}
                  {evalResult && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                            Precision@K
                          </span>
                          <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
                            {(evalResult.precisionAtK * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center">
                          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold block">
                            Recall@K
                          </span>
                          <span className="text-base font-black text-indigo-800 dark:text-indigo-200">
                            {(evalResult.recallAtK * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-center">
                          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold block">
                            Faithfulness
                          </span>
                          <span className="text-base font-black text-purple-800 dark:text-purple-200">
                            {(evalResult.faithfulnessScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold block">
                            Citations
                          </span>
                          <span className="text-base font-black text-blue-800 dark:text-blue-200">
                            {(evalResult.citationAccuracy * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">
                            MRR
                          </span>
                          <span className="text-base font-black text-amber-800 dark:text-amber-200">
                            {evalResult.mrr.toFixed(2)}
                          </span>
                        </div>
                        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-center">
                          <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold block">
                            Abstention
                          </span>
                          <span className="text-base font-black text-teal-800 dark:text-teal-200">
                            {(evalResult.abstentionAccuracy * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Detailed Test Run Table */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-700/60 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          Test Suite Breakdown ({evalResult.passedTests}/{evalResult.totalTests} Passed)
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-56 overflow-y-auto">
                          {evalResult.details.map((t) => (
                            <div key={t.testId} className="p-2.5 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-[9px] uppercase font-bold text-indigo-500 block">
                                  {t.expectedCategory.replace('_', ' ')}
                                </span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {t.question}
                                </p>
                                <p className="text-[10px] text-slate-500">{t.notes}</p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                  t.passed
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {t.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
