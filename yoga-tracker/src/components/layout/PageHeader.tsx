import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'panel-header mb-6 border-b-2 border-primary/25 pb-4',
        className
      )}
    >
      <h1 className="page-heading">{title}</h1>
      {description && (
        <p className="mt-1 text-sm font-medium text-text-muted md:text-base">
          {description}
        </p>
      )}
    </header>
  )
}
