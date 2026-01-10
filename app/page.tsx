"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  children: Todo[];
};

const STORAGE_KEY = "nested-todos";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const setCompletionDeep = (todo: Todo, completed: boolean): Todo => ({
  ...todo,
  completed,
  children: todo.children.map((child) => setCompletionDeep(child, completed)),
});

const reconcileCompletion = (todo: Todo): Todo => {
  if (!todo.children.length) {
    return todo;
  }

  const allChildrenDone = todo.children.every((child) => child.completed);
  const anyChildActive = todo.children.some((child) => !child.completed);

  if (anyChildActive && todo.completed) {
    return { ...todo, completed: false };
  }

  if (allChildrenDone && !todo.completed) {
    return { ...todo, completed: true };
  }

  return todo;
};

const reconcileTree = (list: Todo[]): Todo[] =>
  list.map((todo) => {
    const nextChildren = reconcileTree(todo.children);
    return reconcileCompletion({ ...todo, children: nextChildren });
  });

const normalizeTodos = (raw: unknown): Todo[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    id: typeof item?.id === "string" ? item.id : generateId(),
    title: typeof item?.title === "string" ? item.title : "未命名待办",
    completed: Boolean((item as { completed?: boolean })?.completed),
    createdAt:
      typeof item?.createdAt === "string"
        ? (item.createdAt as string)
        : new Date().toISOString(),
    children: normalizeTodos((item as { children?: unknown })?.children ?? []),
  }));
};

const updateTodos = (
  list: Todo[],
  targetId: string,
  updater: (todo: Todo) => Todo,
): [Todo[], boolean] => {
  let changed = false;

  const nextList = list.map((todo) => {
    if (todo.id === targetId) {
      changed = true;
      const updated = updater(todo);
      return reconcileCompletion({
        ...updated,
        children: updated.children ?? [],
      });
    }

    const [childList, childChanged] = updateTodos(
      todo.children,
      targetId,
      updater,
    );

    if (childChanged) {
      changed = true;
      return reconcileCompletion({ ...todo, children: childList });
    }

    return todo;
  });

  return [changed ? nextList : list, changed];
};

const deleteTodo = (list: Todo[], targetId: string): [Todo[], boolean] => {
  let changed = false;

  const filtered = list
    .map((todo) => {
      if (todo.id === targetId) {
        changed = true;
        return null;
      }

      const [children, childChanged] = deleteTodo(todo.children, targetId);
      if (childChanged) changed = true;

      if (children !== todo.children) {
        return reconcileCompletion({ ...todo, children });
      }

      return todo;
    })
    .filter(Boolean) as Todo[];

  return [changed ? filtered : list, changed];
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const collectStats = (
  list: Todo[],
): {
  total: number;
  completed: number;
} =>
  list.reduce(
    (acc, todo) => {
      const child = collectStats(todo.children);
      return {
        total: acc.total + 1 + child.total,
        completed: acc.completed + (todo.completed ? 1 : 0) + child.completed,
      };
    },
    { total: 0, completed: 0 },
  );

export default function HomePage() {
  const { data: session, status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem("todos");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setTodos(reconcileTree(normalizeTodos(parsed)));
    } catch (error) {
      console.error("Failed to parse stored todos", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const { completed: completedCount, total: totalCount } = useMemo(
    () => collectStats(todos),
    [todos],
  );

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    const next = [
      ...todos,
      {
        id: generateId(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        children: [],
      },
    ];
    setTodos(reconcileTree(next));
    setNewTitle("");
  };

  const handleToggle = (id: string) => {
    setTodos((current) => {
      const [next, changed] = updateTodos(current, id, (todo) => {
        const completed = !todo.completed;
        return {
          ...todo,
          completed,
          children: todo.children.map((child) =>
            setCompletionDeep(child, completed),
          ),
        };
      });
      return changed ? next : current;
    });
  };

  const handleEdit = (id: string, title: string) => {
    setTodos((current) => {
      const [next, changed] = updateTodos(current, id, (todo) => ({
        ...todo,
        title,
      }));
      return changed ? next : current;
    });
  };

  const handleDelete = (id: string) => {
    setTodos((current) => {
      const [next, changed] = deleteTodo(current, id);
      return changed ? reconcileTree(next) : current;
    });
  };

  const handleAddChild = (parentId: string, title: string) => {
    setTodos((current) => {
      const [next, changed] = updateTodos(current, parentId, (todo) => ({
        ...todo,
        children: [
          ...todo.children,
          {
            id: generateId(),
            title,
            completed: todo.completed,
            createdAt: new Date().toISOString(),
            children: [],
          },
        ],
      }));
      return changed ? reconcileTree(next) : current;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">
              Nested Todo
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              层级 TODO 列表
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              管理父子任务，支持新增、编辑、完成与删除。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
            <div className="text-sm">
              <p className="font-semibold text-emerald-700">
                {session?.user?.name || "未登录"}
              </p>
              <p className="text-xs text-slate-500">
                {status === "authenticated"
                  ? (session?.user as { username?: string })?.username ||
                    "todolistusername"
                  : "登录后管理任务"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              退出登录
            </button>
          </div>
        </header>

        <section className="grid gap-4 rounded-xl border border-emerald-100 bg-white p-6 shadow-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              总任务
            </p>
            <p className="text-2xl font-semibold text-slate-900">{totalCount}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              已完成
            </p>
            <p className="text-2xl font-semibold text-emerald-700">
              {completedCount}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              状态
            </p>
            <p className="text-sm text-slate-600">
              {totalCount === 0
                ? "暂无数据，先添加一个父 TODO 吧。"
                : `${completedCount} / ${totalCount} 已完成`}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                新建父级 TODO
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="输入要完成的事项"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  添加
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              父 TODO 完成时，其所有子 TODO 会同步完成；当子 TODO 全部完成，父 TODO
              自动完成。
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {todos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              还没有任务，创建一个父 TODO 来开始吧。
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                depth={0}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}

type TodoItemProps = {
  todo: Todo;
  depth: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onAddChild: (parentId: string, title: string) => void;
};

function TodoItem({
  todo,
  depth,
  onToggle,
  onDelete,
  onEdit,
  onAddChild,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [childTitle, setChildTitle] = useState("");

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.title]);

  const saveEdit = () => {
    const title = draft.trim();
    if (!title) return;
    onEdit(todo.id, title);
    setEditing(false);
  };

  const addChild = () => {
    const title = childTitle.trim();
    if (!title) return;
    onAddChild(todo.id, title);
    setChildTitle("");
  };

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      style={{ marginLeft: depth * 16 }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 items-start gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
            aria-label="完成状态"
          />
          <div className="flex-1 space-y-1">
            {editing ? (
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            ) : (
              <p
                className={`text-base font-semibold ${
                  todo.completed ? "text-slate-400 line-through" : "text-slate-900"
                }`}
              >
                {todo.title}
              </p>
            )}
            <p className="text-xs text-slate-500">
              创建时间：{formatDate(todo.createdAt)}
            </p>
            {editing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(todo.title);
                    setEditing(false);
                  }}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(todo.id)}
                  className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {todo.children.length} 个子 TODO
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={childTitle}
          onChange={(event) => setChildTitle(event.target.value)}
          placeholder="添加子 TODO"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="button"
          onClick={addChild}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          添加子 TODO
        </button>
      </div>

      {todo.children.length ? (
        <div className="mt-4 space-y-3 border-l border-dashed border-slate-200 pl-4">
          {todo.children.map((child) => (
            <TodoItem
              key={child.id}
              todo={child}
              depth={depth + 1}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
