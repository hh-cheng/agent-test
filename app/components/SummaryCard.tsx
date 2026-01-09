type SummaryCardProps = {
  title: string
  amount: string
  change: string
  trend: 'up' | 'down'
}

export default function SummaryCard({
  title,
  amount,
  change,
  trend,
}: SummaryCardProps) {
  const trendStyles =
    trend === 'up'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trendStyles}`}
        >
          {change}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
        {amount}
      </p>
    </div>
  )
}
