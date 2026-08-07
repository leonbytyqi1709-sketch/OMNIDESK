import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/clerk-react'
import { ModuleLoader } from '@/components/layout/ModuleLoader'
import { AppRouter } from './router'
import { SignInPage } from './SignInPage'

export default function App() {
  return (
    <>
      <ClerkLoading>
        <div className="flex min-h-screen items-center justify-center">
          <ModuleLoader />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <AppRouter />
        </SignedIn>
        <SignedOut>
          <SignInPage />
        </SignedOut>
      </ClerkLoaded>
    </>
  )
}
