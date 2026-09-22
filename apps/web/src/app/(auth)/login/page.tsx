'use client';

/**
 * Login page — fintech-style auth with email/password + Google OAuth button.
 * Uses Framer Motion for entry animations and react-hook-form + Zod validation.
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useGoogleLogin } from '@react-oauth/google';

/* ---------- Validation schema ---------- */
const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setServerError('');
      try {
        const res = await api.post('/auth/google/mobile', { accessToken: tokenResponse.access_token });
        const { access_token, user } = res.data;
        login(user, access_token);
        router.push('/dashboard');
      } catch (err: any) {
        setServerError(err.response?.data?.message || 'Google authentication failed.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => setServerError('Google login was unsuccessful. Please try again.'),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');
      
      if (token) {
        const isComplete = params.get('isProfileComplete') === 'true';
        const user = {
          id: params.get('userId') || '',
          name: params.get('name') || '',
          email: params.get('email') || '',
          employmentType: 'SALARIED' as const,
          isProfileComplete: isComplete,
          createdAt: new Date().toISOString(),
        };
        // Clear the URL so we don't re-process the token if the component re-renders
        window.history.replaceState({}, document.title, '/login');
        
        // Log the user in and redirect
        login(user, token);
        if (!isComplete) {
          window.location.href = '/complete-profile';
        } else {
          window.location.href = '/dashboard';
        }
      }
      
      if (error) {
        setServerError('Google authentication failed. Please try again.');
        // clear URL
        window.history.replaceState({}, document.title, '/login');
      }
    }
  }, [login]);

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.access_token);
      if (!res.data.user.isProfileComplete) {
        router.push('/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  /* Container animation */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Logo */}
      <motion.div variants={item} className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center
                        shadow-lg shadow-violet-900/40">
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[var(--text-primary)] leading-none">AI Finance</p>
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Sparkles size={9} className="text-violet-400" /> Copilot
          </p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div variants={item} className="card-glass p-7 rounded-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sign in to your financial dashboard
          </p>
        </div>

        {/* Google button */}
        <button
          suppressHydrationWarning
          type="button"
          disabled={isGoogleLoading}
          onClick={() => googleLogin()}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-5
                     rounded-xl border border-[var(--border-strong)]
                     bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium
                     hover:bg-[var(--bg-overlay)] transition-colors duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
             <div className="w-5 h-5 border-2 border-[var(--text-muted)] border-t-[var(--primary)] rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[var(--border-default)]" />
          <span className="text-[11px] text-[var(--text-muted)]">or continue with email</span>
          <div className="flex-1 h-px bg-[var(--border-default)]" />
        </div>

        {/* Form */}
        <form suppressHydrationWarning onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {serverError}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="login-email" className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
              Email address
            </label>
            <input
              suppressHydrationWarning
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                suppressHydrationWarning
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl outline-none"
                {...register('password')}
              />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]
                           hover:text-[var(--text-primary)] transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            suppressHydrationWarning
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-2
                       rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                       text-white text-sm font-semibold transition-colors duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              <>Sign in <ArrowRight size={15} /></>
            )}
          </button>
        </form>
      </motion.div>

      {/* Sign up link */}
      <motion.p variants={item} className="text-center text-sm text-[var(--text-muted)] mt-5">
        New to AI Finance?{' '}
        <Link href="/register" className="text-[var(--primary)] hover:underline font-medium">
          Create free account
        </Link>
      </motion.p>
    </motion.div>
  );
}
