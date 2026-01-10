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

const STORAGE_KEY = "nested-todo-list";
const fixedNow = () => new Date().toISOString();

const seedTodos: Todo[] = [
  {
    id: "welcome",
    title: "欢迎使用层级 TODO，先添加一个任务吧",
    completed: false,
    createdAt: fixedNow(),
    children: [
      {
        id: "welcome-child-1",
        title: "点击勾选完成状态",
        completed: false,
        createdAt: fixedNow(),
        children: [],
      },
      {
        id: "welcome-child-2",
        title: "为父任务再添加一个子任务",
        completed: false,
        createdAt: fixedNow(),
        children: [],
      },
    ],
  },
  {
    id: "organize",
    title: "规划今天的工作",
    completed: false,
    createdAt: fixedNow(),
    children: [],
  },
];

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const normalizeTodo = (todo: Todo): Todo => {
  const children = (todo.children ?? []).map((child) => normalizeTodo(child));
  if (children.length === 0) {
    return {
      ...todo,
      children: [],
    };
  }
  const allChildrenDone = children.every((child) => child.completed);
  return {
    ...todo,
    children,
    completed: allChildrenDone,
  };
};

const normalizeList = (list: Todo[]): Todo[] =>
  list.map((item) =>
    normalizeTodo({
      ...item,
      id: item.id ?? createId(),
      title: item.title ?? "未命名任务",
      completed: Boolean(item.completed),
      createdAt: item.createdAt ?? fixedNow(),
      children: item.children ?? [],
    }),
  );

const setCompletionForBranch = (todo: Todo, completed: boolean): Todo => ({
  ...todo,
  completed,
  children: todo.children.map((child) =>
    setCompletionForBranch(child, completed),
  ),
});

const toggleCompletion = (todos: Todo[], id: string) =>
  normalizeList(
    todos.map((todo) => {
      if (todo.id === id) {
        const updatedChildren = todo.children.map((child) =>
          setCompletionForBranch(child, !todo.completed),
        );
        return {
          ...todo,
          completed: !todo.completed,
          children: updatedChildren,
        };
      }
      return {
        ...todo,
        children: toggleCompletion(todo.children, id),
      };
    }),
  );

const editTitle = (todos: Todo[], id: string, title: string): Todo[] =>
  todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, title: title.trim() || todo.title };
    }
    return { ...todo, children: editTitle(todo.children, id, title) };
  });

const deleteTodo = (todos: Todo[], id: string): Todo[] =>
  normalizeList(
    todos
      .filter((todo) => todo.id !== id)
      .map((todo) => ({
        ...todo,
        children: deleteTodo(todo.children, id),
      })),
  );

const addChild = (todos: Todo[], parentId: string, child: Todo): Todo[] =>
  normalizeList(
    todos.map((todo) => {
      if (todo.id === parentId) {
        return {
          ...todo,
          children: [...todo.children, child],
        };
      }
      return { ...todo, children: addChild(todo.children, parentId, child) };
    }),
  );

const ensureChildDefaults = (todos: Todo[]) => {
  if (todos.length > 0) {
    return normalizeList(todos);
  }
  return normalizeList(seedTodos);
};

const findTodoById = (todos: Todo[], id: string): Todo | null => {
  for (const todo of todos) {
    if (todo.id === id) return todo;
    const child = findTodoById(todo.children, id);
    if (child) return child;
  }
  return null;
};

type TodoItemProps = {
  todo: Todo;
  depth?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onAddChild: (parentId: string, title: string) => void;
};

const TodoItem = ({
  todo,
  depth = 0,
  onToggle,
  onDelete,
  onEdit,
  onAddChild,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [childTitle, setChildTitle] = useState("");

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.title]);

  const handleEdit = () => {
    if (!draft.trim()) return;
    onEdit(todo.id, draft.trim());
    setIsEditing(false);
  };

  const handleAddChild = () => {
    if (!childTitle.trim()) return;
    onAddChild(todo.id, childTitle.trim());
    setChildTitle("");
  };

  const createdTime = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(todo.createdAt)),
    [todo.createdAt],
  );

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
        depth > 0 ? "ml-4 border-l-4 border-l-emerald-200" : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <input
            aria-label="完成状态"
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="mt-1 h-5 w-5 accent-emerald-500"
          />
          <div className="flex flex-1 flex-col gap-1">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleEdit}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setDraft(todo.title);
                    setIsEditing(false);
                  }}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-base font-medium ${
                      todo.completed ? "text-slate-400 line-through" : ""
                    }`}
                  >
                    {todo.title}
                  </p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    {todo.completed ? "已完成" : "待完成"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">创建于 {createdTime}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              编辑
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              删除
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold text-slate-600">
            添加子 TODO（支持多个）
          </p>
          <div className="flex gap-2">
            <input
              value={childTitle}
              onChange={(event) => setChildTitle(event.target.value)}
              placeholder="输入子任务..."
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleAddChild}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              添加
            </button>
          </div>
        </div>

        {todo.children.length > 0 ? (
          <div className="mt-1 flex flex-col gap-3">
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
    </div>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setTodos(normalizeList(seedTodos));
      setHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Todo[];
      setTodos(ensureChildDefaults(parsed));
    } catch {
      setTodos(normalizeList(seedTodos));
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  const addParentTodo = () => {
    if (!newTitle.trim()) return;
    const todo: Todo = {
      id: createId(),
      title: newTitle.trim(),
      completed: false,
      createdAt: fixedNow(),
      children: [],
    };
    setTodos((prev) => normalizeList([...prev, todo]));
    setNewTitle("");
  };

  const handleAddChild = (parentId: string, title: string) => {
    setTodos((prev) =>
      addChild(prev, parentId, {
        id: createId(),
        title,
        completed: findTodoById(prev, parentId)?.completed ?? false,
        createdAt: fixedNow(),
        children: [],
      }),
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => deleteTodo(prev, id));
  };

  const handleEdit = (id: string, title: string) => {
    setTodos((prev) => editTitle(prev, id, title));
  };

  const handleToggle = (id: string) => {
    setTodos((prev) => toggleCompletion(prev, id));
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">加载中...</p>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">正在加载 TODO 数据...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
              Nested Todo
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              管理父 / 子 TODO
            </h1>
            <p className="text-sm text-slate-600">
              创建任务、拆分子任务，父任务完成会同步子任务，所有子任务完成后自动完成父任务。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">当前用户</span>
              <span className="text-sm font-medium text-slate-800">
                {session?.user?.name ?? "TODO 用户"}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              退出登录
            </button>
          </div>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            新建父 TODO
          </h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="输入任务标题，按下添加"
              className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={addParentTodo}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              添加
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              TODO 列表
            </h2>
            <span className="text-sm text-slate-500">
              {todos.length} 个父 TODO
            </span>
          </div>
          {todos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              还没有任务，先创建一个吧。
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onAddChild={handleAddChild}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
