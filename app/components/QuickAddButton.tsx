import Image from 'next/image'

type QuickAddButtonProps = {
  label: string
}

export default function QuickAddButton({ label }: QuickAddButtonProps) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl bg-zinc-900 px-6 py-4 text-left text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
      <div>
        <p className="text-sm text-zinc-300 dark:text-zinc-500">快速记账</p>
        <p className="text-lg font-semibold">{label}</p>
      </div>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 dark:bg-zinc-900/10">
        <Image
          className="dark:invert"
          src="/file.svg"
          alt="新增"
          width={20}
          height={20}
        />
      </span>
    </button>
  )
}
