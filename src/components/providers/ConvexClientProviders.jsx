'use client'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import useMounted from '../../hooks/useMounted'
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)
const ConvexClientProviders = ({children}) => {
  const mounted = useMounted();

  if(!mounted) return null;
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

export default ConvexClientProviders
