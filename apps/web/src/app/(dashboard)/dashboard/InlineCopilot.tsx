'use client';

/**
 * Inline AI Copilot panel for the dashboard home page.
 * The AI is the product — this is the hero.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Sparkles, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Msg { id: string; role: 'user' | 'assistant'; content: string; ts: Date; }

const PROMPTS = [
  { label: 'Spending analysis',  text: 'Why did my spending increase this month?' },
  { label: 'Save more',          text: 'How can I save ₹10,000 this month?' },
  { label: 'Portfolio review',   text: 'How is my investment portfolio performing?' },
  { label: 'Predict expenses',   text: 'Predict my expenses for next month.' },
  { label: 'Tax tips',           text: 'What tax deductions can I claim this year?' },
  { label: 'Budget insights',    text: 'Am I on track with my monthly budget?' },
];

function TypingDots() {
  return (
    <div className="chat-ai inline-flex items-center gap-1.5">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

export default function InlineCopilot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', content: text, ts: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    if (textRef.current) textRef.current.style.height = 'auto';
    setTyping(true);

    try {
      const res  = await fetch('http://localhost:8000/api/v1/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, thread_id: 'dashboard_inline' }),
      });
      const data = await res.json();
      setMessages((p) => [...p, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: data.reply || 'I couldn\'t process that. Please try again.',
        ts: new Date(),
      }]);
    } catch {
      setMessages((p) => [...p, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: 'Unable to connect to AI service. Please check your connection.',
        ts: new Date(),
      }]);
    } finally {
      setTyping(false);
    }
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div className="card h-full flex flex-col p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-[var(--primary-subtle)] border border-[var(--primary-muted)] flex items-center justify-center">
            <Sparkles size={14} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className="t-title leading-tight">AI Copilot</p>
            <div className="flex items-center gap-1.5 mt-px">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              <span className="t-muted" style={{ fontSize: 11 }}>Online · GPT-4o</span>
            </div>
          </div>
        </div>
        <Link
          href="/assistant"
          className="flex items-center gap-1 text-[12px] font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Full view
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Messages / Empty state */}
      <div className="flex-1 overflow-y-auto px-5 py-4 no-scroll">
        {isEmpty ? (
          /* Empty state — prompt grid */
          <div className="h-full flex flex-col justify-center">
            <p className="t-muted mb-4 text-center" style={{ fontSize: 13 }}>
              Ask anything about your finances
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p.text}
                  onClick={() => send(p.text)}
                  className="text-left rounded-[10px] px-3 py-2.5 border border-[var(--border)]
                             bg-[var(--bg)] hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]
                             transition-all duration-150 group"
                >
                  <p className="text-[12px] font-medium text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                    {p.label}
                  </p>
                  <p className="text-[12px] text-[var(--text)] leading-snug mt-0.5">{p.text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold',
                  msg.role === 'user'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]',
                )}>
                  {msg.role === 'user' ? 'Y' : <Sparkles size={10} />}
                </div>
                <div className={cn('max-w-[82%]', msg.role === 'assistant' && 'flex-1')}>
                  <div className={msg.role === 'user' ? 'chat-user' : 'chat-ai'}>
                    {msg.role === 'user' ? (
                      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p:      ({ children }) => <p style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 6 }} className="last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{children}</strong>,
                          ul:     ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 6 }} className="list-disc">{children}</ul>,
                          li:     ({ children }) => <li style={{ fontSize: 13, marginBottom: 2 }}>{children}</li>,
                          code:   ({ children }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--bg)', borderRadius: 4, padding: '1px 5px' }}>{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  <p suppressHydrationWarning style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <Sparkles size={10} className="text-[var(--text-faint)]" />
                  </div>
                  <TypingDots />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-[var(--border)] px-4 py-3">
        <div className="flex items-end gap-2">
          <button className="btn btn-icon w-8 h-8 self-end" aria-label="Attach file" title="Attach PDF or CSV">
            <Paperclip size={14} />
          </button>
          <textarea
            ref={textRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder="Ask about your finances…"
            disabled={typing}
            rows={1}
            style={{
              flex: 1, resize: 'none', border: '1px solid var(--border)',
              borderRadius: 8, background: 'var(--bg)',
              fontSize: 13, lineHeight: 1.5, padding: '7px 12px',
              color: 'var(--text)', outline: 'none',
              minHeight: 36, maxHeight: 120,
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px var(--primary-subtle)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button className="btn btn-icon w-8 h-8 self-end" aria-label="Voice input" title="Voice input">
            <Mic size={14} />
          </button>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            className="btn btn-primary w-8 h-8 p-0 rounded-[8px] self-end flex-shrink-0 disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={13} />
          </button>
        </div>
        {!isEmpty && (
          <p style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', marginTop: 6 }}>
            AI Copilot · Verify important decisions independently
          </p>
        )}
      </div>
    </div>
  );
}
