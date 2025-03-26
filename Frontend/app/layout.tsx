import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ContextProvider } from './context';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ISO+ Portal',
  description: 'Portal for ISO+ services and workspace management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProvider>
            {children}
          </ContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}