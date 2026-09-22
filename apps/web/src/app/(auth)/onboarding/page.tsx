'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const schema = z.object({
  phone:    z.string().min(10, 'Phone must be at least 10 digits'),
  address:  z.string().min(5, 'Address is required'),
  dob:      z.string().min(1, 'Date of Birth is required'),
  pan:      z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  employmentType: z.enum(['SALARIED', 'BUSINESS']),
  annualIncome: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
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
      const payload = { userId: user?.id, ...data };
      const res = await api.post('/auth/complete-profile', payload);
      login(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-md w-full mx-auto">
      <motion.div variants={item} className="flex items-center justify-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-violet-900/40">
          <UserCheck size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[var(--text-primary)] leading-none">Complete Profile</p>
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Sparkles size={9} className="text-violet-400" /> AI Finance
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-glass p-7 rounded-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Welcome, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            We need a few more details to set up your financial copilot properly.
          </p>
        </div>

        <form suppressHydrationWarning onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">{serverError}</p>}
          
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
              <select className="w-full px-4 py-2.5 text-sm rounded-xl outline-none bg-[var(--bg-elevated)]" {...register('employmentType')}>
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

          <button
            suppressHydrationWarning
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-4
                       rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                       text-white text-sm font-semibold transition-colors duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving details…
              </span>
            ) : (
              <>Complete Setup <ArrowRight size={15} /></>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
