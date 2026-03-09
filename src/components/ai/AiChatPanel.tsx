import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { viewSuggestions, aiResponses, aiFallbackResponse } from '../../data/ai-responses';
import type { AiAction } from '../../data/ai-responses';

interface AiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
  onEscalate: () => void;
  onOpenDraft: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actions?: AiAction[];
}

/* ------------------------------------------------------------------ */
/*  MessageContent — renders markdown-lite text                        */
/* ------------------------------------------------------------------ */
function MessageContent({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let key = 0;

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={key++} className="mt-1 mb-1 space-y-0.5 pl-3">
        {bulletBuffer.map((b, i) => (
          <li key={i} className="text-sm leading-relaxed list-disc">
            <InlineFormat text={b} />
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  }

  for (const line of lines) {
    if (line.startsWith('- ')) {
      bulletBuffer.push(line.slice(2));
    } else {
      flushBullets();
      if (line.trim() === '') {
        elements.push(<div key={key++} className="h-1.5" />);
      } else {
        elements.push(
          <p key={key++} className="text-sm leading-relaxed">
            <InlineFormat text={line} />
          </p>
        );
      }
    }
  }
  flushBullets();

  return <div>{elements}</div>;
}

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */
export function AiChatPanel({
  isOpen,
  onClose,
  activeView,
  onNavigate,
  onEscalate,
  onOpenDraft,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? inputValue).trim();
      if (!msg || isThinking) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: msg,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsThinking(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Simulate AI thinking delay
      const delay = 1000 + Math.random() * 500;
      setTimeout(() => {
        const response = aiResponses[msg] ?? aiFallbackResponse;
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.text,
          actions: response.actions,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsThinking(false);
      }, delay);
    },
    [inputValue, isThinking]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAutoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleAction = (action: AiAction) => {
    if (action.type === 'navigate') {
      onNavigate(action.target);
      onClose();
    } else if (action.target === 'escalation') {
      onEscalate();
      onClose();
    } else if (action.target === 'draft-email') {
      onOpenDraft();
      onClose();
    }
  };

  const suggestions = viewSuggestions[activeView] ?? viewSuggestions['dashboard'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="ai-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[420px] flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                </div>
                <h2 className="text-base font-semibold text-white">AI Assistant</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isThinking ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500/60" />
                    <p className="text-xs text-neutral-500">
                      Ask me anything about this shipment, or try a suggestion:
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="w-full text-left px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs text-neutral-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2.5 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-neutral-800 text-neutral-200'
                        }`}
                      >
                        <MessageContent text={msg.text} />
                        {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-neutral-700/60">
                            {msg.actions.map((action) => (
                              <button
                                key={action.label}
                                onClick={() => handleAction(action)}
                                className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors ring-1 ring-blue-500/20"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-800 rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm text-neutral-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-neutral-800 p-4">
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {suggestions.slice(0, 2).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-2 py-1 bg-neutral-800 rounded-md text-[10px] text-neutral-400 hover:bg-neutral-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleAutoResize}
                  placeholder="Ask about this shipment..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  style={{ minHeight: '36px', maxHeight: '120px' }}
                  disabled={isThinking}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isThinking}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
