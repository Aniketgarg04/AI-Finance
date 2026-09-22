'use client';

/**
 * AI Copilot — Full-page finance chat interface.
 * ChatGPT-quality UX, adapted for personal finance.
 * Features: streaming responses, suggested prompts, file upload,
 *           voice input, human-in-the-loop approval, dark mode.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, RotateCcw, Paperclip, Mic,
  CheckCircle2, XCircle, TrendingUp, PieChart,
  CreditCard, FileText, HelpCircle, BarChart2, ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface Msg { id: string; role: 'user' | 'assistant'; content: string; ts: Date; }

const SUGGESTIONS = [
  { icon: TrendingUp,  label: 'Stock Buy/Sell Advice', text: 'Analyze my stock portfolio and tell me which stocks to buy, hold, or sell with target prices.' },
  { icon: BarChart2,   label: 'Live Stock Intelligence', text: 'What is the live price, PE ratio, and analyst rating for Reliance, TCS, and Tata Motors?' },
  { icon: PieChart,    label: 'Save more',             text: 'How can I save ₹10,000 this month?' },
  { icon: CreditCard,  label: 'Predict expenses',      text: 'Predict my expenses for next month.' },
  { icon: FileText,    label: 'Summarize finances',    text: 'Give me a summary of my financial health this quarter.' },
  { icon: HelpCircle,  label: 'Tax tips',              text: 'What tax deductions can I claim this year?' },
];

const WELCOME: Msg = {
  id: 'welcome', role: 'assistant', ts: new Date(),
  content: "Hello! I'm your AI Finance Copilot.\n\nI have real-time access to your bank transactions, Demat stock portfolio, budgets, and live market web intelligence. Ask me anything — from live stock Buy/Hold/Sell advice to tax planning!\n\nWhat would you like to explore today?",
};

/* ── Message bubble ──────────────────────────────────────── */
function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
      style={{ maxWidth: '100%' }}
    >
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'var(--primary)' : 'var(--bg)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#fff' : 'var(--text-muted)',
        fontSize: 11, fontWeight: 600,
      }}>
        {isUser ? 'Y' : <Sparkles size={12} />}
      </div>

      {/* Content */}
      <div style={{ maxWidth: isUser ? '78%' : '84%', minWidth: 0 }}>
        <div className={isUser ? 'chat-user' : 'chat-ai'}>
          {isUser ? (
            <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p:      ({ children }) => <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8, color: 'var(--text)' }} className="last:mb-0">{children}</p>,
                strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{children}</strong>,
                ul:     ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 8 }} className="list-disc">{children}</ul>,
                ol:     ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 8 }} className="list-decimal">{children}</ol>,
                li:     ({ children }) => <li style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 3, color: 'var(--text)' }}>{children}</li>,
                h3:     ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, marginTop: 10, color: 'var(--text)' }}>{children}</h3>,
                code:   ({ children }) => (
                  <code style={{
                    fontFamily: 'monospace', fontSize: 12,
                    background: 'var(--bg)', borderRadius: 4,
                    padding: '1px 5px', color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}>{children}</code>
                ),
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        <p suppressHydrationWarning style={{
          fontSize: 10, color: 'var(--text-faint)', marginTop: 3,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Typing indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--bg)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Sparkles size={12} style={{ color: 'var(--text-faint)' }} />
      </div>
      <div className="chat-ai" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </motion.div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ onPrompt }: { onPrompt: (t: string) => void }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'var(--primary-subtle)', border: '1px solid var(--primary-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Sparkles size={20} style={{ color: 'var(--primary)' }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          AI Finance Copilot
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 400 }}>
          Ask me about your spending, investments, budget, or taxes.
          I have access to all your financial data.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12, width: '100%', maxWidth: 720,
      }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onPrompt(s.text)}
            className="card card-hover"
            style={{
              padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'var(--bg)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}>
              <s.icon size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{s.text}</p>
            </div>
            <ArrowRight size={13} style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: 4 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [pending, setPending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = useCallback(async (text: string, approval?: boolean) => {
    if (!text.trim() && approval === undefined) return;

    if (text.trim()) {
      setMessages((p) => [...p, { id: `u-${Date.now()}`, role: 'user', content: text, ts: new Date() }]);
      setInput('');
      if (textRef.current) { textRef.current.style.height = 'auto'; }
    }
    setTyping(true);
    setPending(false);

    try {
      const res = await fetch('http://localhost:8000/api/v1/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, thread_id: 'user_session_1', approval }),
      });
      const data = await res.json();
      setMessages((p) => [...p, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: data.reply || 'I couldn\'t process that. Please try again.',
        ts: new Date(),
      }]);
      if (data.pending_approval) setPending(true);
    } catch {
      setMessages((p) => [...p, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: 'Unable to reach the AI service. Please check your connection and try again.',
        ts: new Date(),
      }]);
    } finally {
      setTyping(false);
    }
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div style={{
      height: 'calc(100dvh - 60px)',
      maxHeight: 'calc(100dvh - 60px)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 860, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary-subtle)', border: '1px solid var(--primary-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>AI Copilot</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>GPT-4o · Finance specialist</span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setPending(false); }}
            className="btn btn-secondary"
            style={{ fontSize: 13, gap: 6 }}
          >
            <RotateCcw size={13} /> New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }} className="no-scroll">
        {isEmpty ? (
          <EmptyState onPrompt={send} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
            <Bubble msg={WELCOME} />
            {messages.map((m) => <Bubble key={m.id} msg={m} />)}

            <AnimatePresence>
              {typing && <TypingIndicator />}
            </AnimatePresence>

            {/* HITL Approval */}
            <AnimatePresence>
              {pending && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="card"
                  style={{ borderLeft: '3px solid var(--warning)', paddingLeft: 16 }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>
                    Action requires approval
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                    The AI is about to perform a high-impact action. Please review and confirm.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => send('', true)}
                      className="btn btn-primary"
                      style={{ fontSize: 13, gap: 6 }}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => send('', false)}
                      className="btn btn-secondary"
                      style={{ fontSize: 13, gap: 6, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Prompt chips — only when conversation is empty */}
      {isEmpty && (
        <div style={{ flexShrink: 0, overflowX: 'auto', paddingBottom: 12, display: 'flex', gap: 8 }} className="no-scroll">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s.text}
              onClick={() => send(s.text)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '6px 12px', cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                (e.currentTarget as HTMLElement).style.background = 'var(--primary-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
              }}
            >
              <s.icon size={12} /> {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div style={{ flexShrink: 0, paddingTop: 4, paddingBottom: 8 }}>
        <div className="card" style={{
          padding: '10px 12px',
          display: 'flex', alignItems: 'flex-end', gap: 8,
        }}>
          <button className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8, alignSelf: 'flex-end' }} aria-label="Attach file" title="Attach PDF or CSV">
            <Paperclip size={14} />
          </button>
          <textarea
            ref={textRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder="Ask about your finances… (Shift+Enter for new line)"
            disabled={typing}
            rows={1}
            style={{
              flex: 1, resize: 'none', border: '1px solid var(--border)',
              borderRadius: 8, background: 'var(--bg)',
              fontSize: 14, lineHeight: 1.55, padding: '8px 12px',
              color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              minHeight: 38, maxHeight: 140,
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
          <button className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8, alignSelf: 'flex-end' }} aria-label="Voice input" title="Voice input (coming soon)">
            <Mic size={14} />
          </button>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            className="btn btn-primary"
            style={{ width: 36, height: 36, padding: 0, borderRadius: 8, alignSelf: 'flex-end', flexShrink: 0 }}
            aria-label="Send"
          >
            <Send size={14} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', marginTop: 8 }}>
          AI Copilot can make mistakes. Verify important financial decisions independently.
        </p>
      </div>
    </div>
  );
}
