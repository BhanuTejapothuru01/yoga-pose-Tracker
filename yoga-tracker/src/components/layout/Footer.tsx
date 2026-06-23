import Link from 'next/link'

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/login', label: 'Sign in' },
]

export function Footer() {
  return (
    <footer className="border-t-4 border-primary/30 bg-text-brand text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 text-xl font-extrabold tracking-tight">YogaTracker</div>
            <p className="max-w-sm text-sm text-white/75">
              Fitness and yoga tracking with a webcam. Built as a college project.
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-white/85 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-center">
          <p className="text-sm text-white/50">© 2026 YogaTracker</p>
        </div>
      </div>
    </footer>
  )
}
