import QuickAddButton from './components/QuickAddButton'
import RecentTransactions from './components/RecentTransactions'
import SummaryCard from './components/SummaryCard'
import ThemeToggle from './components/ThemeToggle'

const summaryItems = [
  {
    title: '本月收入',
    amount: '¥18,420.00',
    change: '+12.4%',
    trend: 'up' as const,
  },
  {
    title: '本月支出',
    amount: '¥9,860.50',
    change: '-6.8%',
    trend: 'down' as const,
  },
  {
    title: '结余',
    amount: '¥8,559.50',
    change: '+18.2%',
    trend: 'up' as const,
  },
]

const accountBalances = [
  { name: '主账户', amount: '¥32,500.00', note: '工资与日常支出' },
  { name: '旅行基金', amount: '¥8,200.00', note: '假期与远行' },
  { name: '投资账户', amount: '¥56,900.00', note: '稳健型理财' },
]

const recentTransactions = [
  {
    id: 'txn-1',
    title: '团队午餐',
    category: '餐饮',
    date: '今天 12:30',
    amount: '-¥268.00',
    status: 'expense' as const,
  },
  {
    id: 'txn-2',
    title: '设计稿结算',
    category: '自由职业',
    date: '昨天 18:12',
    amount: '+¥3,800.00',
    status: 'income' as const,
  },
  {
    id: 'txn-3',
    title: '地铁通勤',
    category: '交通',
    date: '周一 08:10',
    amount: '-¥48.00',
    status: 'expense' as const,
  },
  {
    id: 'txn-4',
    title: '咖啡续杯',
    category: '餐饮',
    date: '周一 16:40',
    amount: '-¥36.00',
    status: 'expense' as const,
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-emerald-50 px-6 py-12 text-zinc-900 transition-colors dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950 dark:text-zinc-100 sm:px-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/20" />
      </div>
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            总览
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">本月财务总览</h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                把握当下收支趋势，快速掌握账户动态。
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
              <ThemeToggle />
              <QuickAddButton label="新增一笔记录" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {summaryItems.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">账户余额</h2>
              <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                管理账户
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {accountBalances.map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-4 dark:border-zinc-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {account.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {account.note}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {account.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <RecentTransactions transactions={recentTransactions} />
        </section>
      </main>
    </div>
  )
}
