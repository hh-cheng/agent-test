'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

type TodoItem = {
  id: string
  text: string
  completed: boolean
}

const demoCredentials = {
  username: 'test123',
  password: 'testpwd123!',
}

export function TodoApp() {
  const { data: session, status } = useSession()
  const [formState, setFormState] = useState(demoCredentials)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    const result = await signIn('credentials', {
      redirect: false,
      username: formState.username,
      password: formState.password,
    })

    if (!result?.ok) {
      setErrorMessage('账号或密码不正确。')
    }
  }

  const addTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newTodo.trim()
    if (!trimmed) {
      return
    }
    setTodos((prev) => [
      { id: crypto.randomUUID(), text: trimmed, completed: false },
      ...prev,
    ])
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-100 px-6 py-12 font-sans text-zinc-900 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950 dark:text-zinc-50">
      <main className="w-full max-w-2xl space-y-10 rounded-3xl bg-white p-10 shadow-xl shadow-zinc-200/40 dark:bg-zinc-900 dark:shadow-none">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            TODO LIST
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            {session
              ? '欢迎回来，开始整理今天的任务吧。'
              : '请先登录以查看你的 TODO list。'}
          </h1>
          <p className="text-base text-zinc-500">
            使用 NextAuth 的 Credentials 登录，账号与密码已预填。
          </p>
        </header>

        {status === 'loading' ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
            正在检查登录状态…
          </div>
        ) : session ? (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">当前账号</p>
                  <p className="text-lg font-semibold">{session.user?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ redirect: false })}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-600 dark:hover:border-white dark:hover:text-white"
                >
                  退出登录
                </button>
              </div>
              <form
                onSubmit={addTodo}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  value={newTodo}
                  onChange={(event) => setNewTodo(event.target.value)}
                  placeholder="添加新的待办事项"
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  添加
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {todos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
                  暂无待办事项，开始创建你的清单吧。
                </div>
              ) : (
                <ul className="space-y-3">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm shadow-zinc-100/70 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none"
                    >
                      <label className="flex items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="h-4 w-4 rounded border-zinc-400 text-zinc-900"
                        />
                        <span
                          className={
                            todo.completed ? 'text-zinc-400 line-through' : ''
                          }
                        >
                          {todo.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                      >
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  账号
                </label>
                <input
                  value={formState.username}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  密码
                </label>
                <input
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
                />
              </div>
              {errorMessage ? (
                <p className="text-sm text-rose-500">{errorMessage}</p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                使用固定账号登录
              </button>
            </form>
            <div className="rounded-2xl bg-white p-4 text-xs text-zinc-500 dark:bg-zinc-950">
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                账号密码（演示）
              </p>
              <p>账号：{demoCredentials.username}</p>
              <p>密码：{demoCredentials.password}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
