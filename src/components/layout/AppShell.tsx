import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="md:pl-60">
        <Navbar />
        <main className="p-3 sm:p-4 md:p-6">
          <div className="panel-card min-h-[calc(100dvh-7rem)] border-2 border-primary/20 p-3 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t-2 border-primary/20 bg-white py-2 shadow-[0_-4px_20px_rgba(45,106,79,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        {[
          { href: '/dashboard', label: 'Home', icon: '🏠' },
          { href: '/session', label: 'Session', icon: '▶️' },
          { href: '/progress', label: 'Progress', icon: '📈' },
          { href: '/profile', label: 'Profile', icon: '👤' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border border-transparent px-2 py-1 text-[10px] font-semibold text-text-muted transition hover:border-primary/20 hover:bg-primary-pale/50 sm:text-xs"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
