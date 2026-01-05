'use client'

import { useMemo, useState } from 'react'

type Todo = {
  id: string
  title: string
  completed: boolean
}

const initialTodos: Todo[] = [
  { id: 't1', title: 'Review today’s priorities', completed: true },
  { id: 't2', title: 'Draft sprint update', completed: false },
  { id: 't3', title: 'Schedule design sync', completed: false },
]

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodo, setNewTodo] = useState('')

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  )

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newTodo.trim()
    if (!trimmed) {
      return
    }

    setTodos((prev) => [
      {
        id: `t${Date.now()}`,
        title: trimmed,
        completed: false,
      },
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

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Today
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Team todo list
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Capture priorities, move work forward, and keep a clean focus view
              of what matters most.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/50">
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
            onSubmit={handleAdd}
          >
            <div className="flex flex-1 flex-col gap-2">
              <label
                className="text-sm font-medium text-slate-300"
                htmlFor="todo"
              >
                Add a task
              </label>
              <input
                id="todo"
                value={newTodo}
                onChange={(event) => setNewTodo(event.target.value)}
                placeholder="e.g. Prepare demo checklist"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-500 px-6 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:mt-7"
            >
              Add task
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            {todos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-8 text-center text-sm text-slate-400">
                You&apos;re all caught up. Add a task to get started.
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <label className="flex items-start gap-3 text-sm sm:text-base">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? 'text-slate-500 line-through'
                          : 'text-slate-100'
                      }`}
                    >
                      {todo.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-rose-400"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            <span>Total tasks: {todos.length}</span>
            <span>Completed: {completedCount}</span>
          </div>
        </section>
      </main>
    </div>
  )
}
