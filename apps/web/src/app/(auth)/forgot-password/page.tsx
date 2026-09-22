'use client';

/**
 * Forgot Password page — email submission form with success state.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Wallet, ArrowLeft, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

const schema = z.object({ email: z.string().email('Please enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 800));
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      {/* Logo */}
      <motion.div variants={item} className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-violet-900/40">
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[var(--text-primary)] leading-none">AI Finance</p>
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Sparkles size={9} className="text-violet-400" /> Copilot
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-glass p-7 rounded-2xl">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center mb-4">
                  <Mail size={22} className="text-[var(--primary)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Forgot password?</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="fp-email" className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Email address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
                    {...register('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                             text-white text-sm font-semibold transition-colors disabled:opacity-60
                             shadow-lg shadow-violet-900/30"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send reset link'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Check your inbox</h2>
              <p className="text-sm text-[var(--text-muted)]">
                We&apos;ve sent a password reset link to<br />
                <span className="text-[var(--text-primary)] font-medium">{submittedEmail}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-4">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="text-[var(--primary)] hover:underline">try again</button>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={item} className="text-center mt-5">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}
