'use client'

import { useMemo, useState } from 'react'

type Subtask = {
  id: string
  title: string
  completed: boolean
}

type Todo = {
  id: string
  title: string
  completed: boolean
  subtasks: Subtask[]
}

const initialTodos: Todo[] = [
  {
    id: 't1',
    title: 'Review today’s priorities',
    completed: true,
    subtasks: [
      { id: 't1-s1', title: 'Scan the calendar', completed: true },
      { id: 't1-s2', title: 'Flag urgent items', completed: true },
    ],
  },
  {
    id: 't2',
    title: 'Draft sprint update',
    completed: false,
    subtasks: [
      { id: 't2-s1', title: 'Summarize progress', completed: false },
      { id: 't2-s2', title: 'List blockers', completed: false },
    ],
  },
  {
    id: 't3',
    title: 'Schedule design sync',
    completed: false,
    subtasks: [{ id: 't3-s1', title: 'Share agenda', completed: false }],
  },
]

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodo, setNewTodo] = useState('')
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>({})

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
        subtasks: [],
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

  const updateSubtaskDraft = (id: string, value: string) => {
    setSubtaskDrafts((prev) => ({ ...prev, [id]: value }))
  }

  const addSubtask = (todoId: string) => {
    const trimmed = (subtaskDrafts[todoId] ?? '').trim()
    if (!trimmed) {
      return
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                {
                  id: `${todoId}-${Date.now()}`,
                  title: trimmed,
                  completed: false,
                },
                ...todo.subtasks,
              ],
            }
          : todo,
      ),
    )
    setSubtaskDrafts((prev) => ({ ...prev, [todoId]: '' }))
  }

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask,
              ),
            }
          : todo,
      ),
    )
  }

  const deleteSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.filter(
                (subtask) => subtask.id !== subtaskId,
              ),
            }
          : todo,
      ),
    )
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
                  className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={subtaskDrafts[todo.id] ?? ''}
                        onChange={(event) =>
                          updateSubtaskDraft(todo.id, event.target.value)
                        }
                        placeholder="Add a sub task"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-100 shadow-inner shadow-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                      />
                      <button
                        type="button"
                        onClick={() => addSubtask(todo.id)}
                        className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-800 px-4 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                      >
                        Add subtask
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {todo.subtasks.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No subtasks yet. Break it down to keep moving.
                        </p>
                      ) : (
                        todo.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                          >
                            <label className="flex items-center gap-3 text-xs">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() =>
                                  toggleSubtask(todo.id, subtask.id)
                                }
                                className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                              />
                              <span
                                className={
                                  subtask.completed
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-200'
                                }
                              >
                                {subtask.title}
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => deleteSubtask(todo.id, subtask.id)}
                              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-rose-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
