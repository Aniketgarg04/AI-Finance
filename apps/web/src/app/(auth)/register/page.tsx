'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Wallet, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone:    z.string().min(10, 'Phone must be at least 10 digits'),
  address:  z.string().min(5, 'Address is required'),
  dob:      z.string().min(1, 'Date of Birth is required'),
  pan:      z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  employmentType: z.enum(['SALARIED', 'BUSINESS']),
  annualIncome: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const CHECKS = [
  { label: '8+ characters',      test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',   test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number',             test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character',  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { employmentType: 'SALARIED', annualIncome: '' }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setServerError('');
      const res = await api.post('/auth/register', data);
      login(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const passedChecks = CHECKS.filter((c) => c.test(password)).length;
  const strengthColor =
    passedChecks <= 1 ? '#ef4444' :
    passedChecks === 2 ? '#f59e0b' :
    passedChecks === 3 ? '#3b82f6' : '#22c55e';

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-center gap-3 mb-6">
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
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Create your account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Start your journey to financial freedom
          </p>
        </div>

        <button
          suppressHydrationWarning
          type="button"
          onClick={() => window.location.href = 'http://localhost:3001/auth/google'}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-5
                     rounded-xl border border-[var(--border-strong)]
                     bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium
                     hover:bg-[var(--bg-overlay)] transition-colors duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[var(--border-default)]" />
          <span className="text-[11px] text-[var(--text-muted)]">or continue with email</span>
          <div className="flex-1 h-px bg-[var(--border-default)]" />
        </div>

        <form suppressHydrationWarning onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">{serverError}</p>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Full name</label>
              <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Email address</label>
              <input type="email" placeholder="you@example.com" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Phone Number</label>
              <input type="tel" placeholder="9876543210" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" {...register('phone')} />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">PAN Number</label>
              <input type="text" placeholder="ABCDE1234F" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none uppercase" {...register('pan')} />
              {errors.pan && <p className="mt-1 text-xs text-red-400">{errors.pan.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Date of Birth</label>
              <input type="date" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" {...register('dob')} />
              {errors.dob && <p className="mt-1 text-xs text-red-400">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Employment</label>
              <select className="w-full px-4 py-2.5 text-sm rounded-xl outline-none bg-white text-black" {...register('employmentType')}>
                <option value="SALARIED">Salaried</option>
                <option value="BUSINESS">Business / Self-Employed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Address</label>
            <input type="text" placeholder="123 Main St, City, State" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" {...register('address')} />
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl outline-none"
                {...register('password', { onChange: (e) => setPassword(e.target.value) })}
              />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[0,1,2,3].map((i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i < passedChecks ? strengthColor : 'var(--border-strong)' }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {CHECKS.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <Check size={10} className={c.test(password) ? 'text-green-400' : 'text-[var(--text-disabled)]'} />
                      <span className={`text-[10px] ${c.test(password) ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

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
                Creating account…
              </span>
            ) : (
              <>Create account <ArrowRight size={15} /></>
            )}
          </button>
        </form>
      </motion.div>

      <motion.p variants={item} className="text-center text-sm text-[var(--text-muted)] mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">Sign in</Link>
      </motion.p>
    </motion.div>
  );
}
