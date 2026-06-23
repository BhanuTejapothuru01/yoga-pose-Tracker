import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-primary">
            YogaTracker
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-text-muted hover:text-text-brand">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-sm !py-2 !px-5">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
