import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import GoogleProvider from '@/components/GoogleProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Finance Copilot',
    template: '%s | AI Finance Copilot',
  },
  description:
    'Your AI-powered personal finance platform — track expenses, manage budgets, analyze investments, and get smart financial insights.',
  keywords: ['finance', 'budget', 'expenses', 'investment', 'tax', 'AI'],
  authors: [{ name: 'AI Finance Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'AI Finance Copilot',
    description: 'Your AI-powered personal finance platform',
    siteName: 'AI Finance Copilot',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="finance-theme"
          disableTransitionOnChange={false}
        >
          <GoogleProvider>
            {children}
          </GoogleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
