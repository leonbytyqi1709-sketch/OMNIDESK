import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { deDE } from '@clerk/localizations'
import { dark } from '@clerk/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

if (!rawKey) {
  throw new Error(
    'VITE_CLERK_PUBLISHABLE_KEY fehlt – bitte in .env.local hinterlegen.',
  )
}

const PUBLISHABLE_KEY: string = rawKey

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      localization={deDE}
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: '#18181b',
          colorInputBackground: '#09090b',
          colorPrimary: '#230d8f',
          colorDanger: '#cf0a0a',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          borderRadius: '0.625rem',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {/* Theme-Verwaltung (Dark/Light/System) – Umschalter in den Einstellungen */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
