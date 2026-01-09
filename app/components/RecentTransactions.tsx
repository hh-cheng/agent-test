type Transaction = {
  id: string
  title: string
  category: string
  date: string
  amount: string
  status: 'income' | 'expense'
}

type RecentTransactionsProps = {
  transactions: Transaction[]
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          最近交易
        </h3>
        <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          查看全部
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {transactions.map((transaction) => {
          const amountColor =
            transaction.status === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {transaction.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {transaction.category} · {transaction.date}
                </p>
              </div>
              <span className={`text-sm font-semibold ${amountColor}`}>
                {transaction.amount}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
