"use client";

import React, { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { ChildFilter, Priority, Todo } from "@/lib/todo-utils";
import {
  collectStats,
  completeChildrenBatch,
  deleteChildrenBatch,
  deleteTodo,
  filterChildren,
  generateId,
  normalizeTodos,
  reconcileTree,
  reorderWithinParent,
  setCompletionDeep,
  updateChildrenPriorityBatch,
  updateTodos,
} from "@/lib/todo-utils";

const STORAGE_KEY = "nested-todos";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const priorityMeta: Record<Priority, { label: string; classes: string }> = {
  high: {
    label: "高",
    classes:
      "border-amber-300 bg-amber-50 text-amber-700",
  },
  medium: {
    label: "中",
    classes: "border-slate-200 bg-slate-50 text-slate-700",
  },
  low: {
    label: "低",
    classes: "border-sky-200 bg-sky-50 text-sky-700",
  },
};

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
        priority: "medium",
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
            priority: "medium",
            children: [],
          },
        ],
      }));
      return changed ? reconcileTree(next) : current;
    });
  };

  const handleReorderChildren = (
    parentId: string,
    sourceId: string,
    targetId: string,
  ) => {
    setTodos((current) => {
      const [next, changed] = reorderWithinParent(
        current,
        parentId,
        sourceId,
        targetId,
      );
      return changed ? next : current;
    });
  };

  const handleBatchComplete = (parentId: string, childIds: string[]) => {
    const targetIds = new Set(childIds);
    setTodos((current) => {
      const [next, changed] = completeChildrenBatch(
        current,
        parentId,
        targetIds,
      );
      return changed ? reconcileTree(next) : current;
    });
  };

  const handleBatchDelete = (parentId: string, childIds: string[]) => {
    const targetIds = new Set(childIds);
    setTodos((current) => {
      const [next, changed] = deleteChildrenBatch(
        current,
        parentId,
        targetIds,
      );
      return changed ? reconcileTree(next) : current;
    });
  };

  const handleUpdatePriority = (id: string, priority: Priority) => {
    setTodos((current) => {
      const [next, changed] = updateTodos(current, id, (todo) => ({
        ...todo,
        priority,
      }));
      return changed ? next : current;
    });
  };

  const handleBatchPriority = (
    parentId: string,
    childIds: string[],
    priority: Priority,
  ) => {
    const targetIds = new Set(childIds);
    setTodos((current) => {
      const [next, changed] = updateChildrenPriorityBatch(
        current,
        parentId,
        targetIds,
        priority,
      );
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
                onReorder={handleReorderChildren}
                onBatchComplete={handleBatchComplete}
                onBatchDelete={handleBatchDelete}
                onUpdatePriority={handleUpdatePriority}
                onBatchPriority={handleBatchPriority}
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
  onReorder: (parentId: string, sourceId: string, targetId: string) => void;
  onBatchComplete: (parentId: string, childIds: string[]) => void;
  onBatchDelete: (parentId: string, childIds: string[]) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onBatchPriority: (
    parentId: string,
    childIds: string[],
    priority: Priority,
  ) => void;
};

function TodoItem({
  todo,
  depth,
  onToggle,
  onDelete,
  onEdit,
  onAddChild,
  onReorder,
  onBatchComplete,
  onBatchDelete,
  onUpdatePriority,
  onBatchPriority,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [childTitle, setChildTitle] = useState("");
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [draggingChildId, setDraggingChildId] = useState<string | null>(null);
  const [childFilter, setChildFilter] = useState<ChildFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.title]);

  useEffect(() => {
    setSelectedChildIds((current) =>
      current.filter((id) => todo.children.some((child) => child.id === id)),
    );
  }, [todo.children]);

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

  const toggleSelection = (childId: string) => {
    setSelectedChildIds((current) =>
      current.includes(childId)
        ? current.filter((id) => id !== childId)
        : [...current, childId],
    );
  };

  const selectAllChildren = () => {
    setSelectedChildIds(visibleChildren.map((child) => child.id));
  };

  const clearSelection = () => setSelectedChildIds([]);

  const handleFilterChange = (value: ChildFilter) => {
    setChildFilter(value);
    clearSelection();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm((previous) => {
      if (previous.trim() && !value.trim()) {
        clearSelection();
      }
      return value;
    });
  };

  const handleBatchCompleteClick = () => {
    if (!selectedChildIds.length) return;
    onBatchComplete(todo.id, selectedChildIds);
    clearSelection();
  };

  const handleBatchDeleteClick = () => {
    if (!selectedChildIds.length) return;
    onBatchDelete(todo.id, selectedChildIds);
    clearSelection();
  };

  const handleBatchPriorityClick = (priority: Priority) => {
    if (!selectedChildIds.length) return;
    onBatchPriority(todo.id, selectedChildIds, priority);
    clearSelection();
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement | HTMLDivElement>,
    childId: string,
  ) => {
    setDraggingChildId(childId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", childId);
  };

  const handleDragEnter = (childId: string) => {
    if (!draggingChildId || draggingChildId === childId) return;
    onReorder(todo.id, draggingChildId, childId);
  };

  const handleDragEnd = () => {
    setDraggingChildId(null);
  };

  const completedChildren = useMemo(
    () => todo.children.filter((child) => child.completed).length,
    [todo.children],
  );
  const totalChildren = todo.children.length;
  const visibleChildren = useMemo(
    () => filterChildren(todo.children, childFilter, searchTerm),
    [todo.children, childFilter, searchTerm],
  );
  const visibleChildrenCount = visibleChildren.length;
  const progressPercent =
    totalChildren === 0
      ? 0
      : Math.round((completedChildren / totalChildren) * 100);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      style={{ marginLeft: depth * 16 }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 items-start gap-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
              aria-label="完成状态"
            />
            <div className="flex-1 space-y-2">
              {editing ? (
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              ) : (
                <p
                  className={`text-base font-semibold ${
                    todo.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {todo.title}
                </p>
              )}
              <p className="text-xs text-slate-500">
                创建时间：{formatDate(todo.createdAt)}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <PriorityBadge priority={todo.priority} />
                <span className="text-[11px] text-slate-500">调整为</span>
                <div className="flex gap-1">
                  {(["high", "medium", "low"] as const).map((priority) => {
                    const active = todo.priority === priority;
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => onUpdatePriority(todo.id, priority)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                          active
                            ? `${priorityMeta[priority].classes} border-dashed`
                            : "border-slate-200 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {priorityMeta[priority].label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {totalChildren ? (
                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">子项进度</span>
                    <span className="text-slate-600">
                      {completedChildren} / {totalChildren} 已完成
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : null}
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
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {todo.children.length} 个子 TODO
            </span>
            {totalChildren ? (
              <span className="text-xs text-slate-500">
                进度 {progressPercent}%
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
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

        {totalChildren ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-700">
                子 TODO 过滤
              </span>
              {[
                { value: "all" as ChildFilter, label: "全部" },
                { value: "active" as ChildFilter, label: "仅未完成" },
                { value: "completed" as ChildFilter, label: "仅已完成" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleFilterChange(item.value)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                    childFilter === item.value
                      ? "border border-emerald-200 bg-white text-emerald-700 shadow-sm"
                      : "border border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <input
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="搜索子 TODO 标题"
                className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-1 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <span className="text-[11px] text-slate-500">
                显示 {visibleChildrenCount} / {totalChildren}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                子 TODO 批量操作
              </span>
              <button
                type="button"
                onClick={selectAllChildren}
                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-white"
              >
                全选(当前筛选)
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-white"
              >
                清空
              </button>
              <span className="text-[11px] text-slate-500">
                已选 {selectedChildIds.length} / {visibleChildrenCount || totalChildren}
              </span>
              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!selectedChildIds.length}
                  onClick={handleBatchCompleteClick}
                  className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  批量完成
                </button>
                <button
                  type="button"
                  disabled={!selectedChildIds.length}
                  onClick={handleBatchDeleteClick}
                  className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  批量删除
                </button>
                <button
                  type="button"
                  disabled={!selectedChildIds.length}
                  onClick={() => handleBatchPriorityClick("high")}
                  className="rounded-md border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  标记高优先级
                </button>
                <button
                  type="button"
                  disabled={!selectedChildIds.length}
                  onClick={() => handleBatchPriorityClick("medium")}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  标记中优先级
                </button>
                <button
                  type="button"
                  disabled={!selectedChildIds.length}
                  onClick={() => handleBatchPriorityClick("low")}
                  className="rounded-md border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  标记低优先级
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              使用左侧把手拖拽调整同级子 TODO 顺序。
            </p>
          </div>
        ) : null}

        {totalChildren ? (
          <div className="space-y-3 border-l border-dashed border-slate-200 pl-4">
            {visibleChildren.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                当前筛选/搜索无匹配的子 TODO。
              </div>
            ) : null}
            {visibleChildren.map((child) => {
              const selected = selectedChildIds.includes(child.id);
              const isDragging = draggingChildId === child.id;
              return (
                <div
                  key={child.id}
                  className={`rounded-xl bg-white shadow-sm transition ${
                    isDragging ? "ring-2 ring-emerald-200" : "border border-slate-200"
                  }`}
                  onDragEnter={() => handleDragEnter(child.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDragEnd}
                >
                  <div className="flex items-start gap-3 p-2">
                    <button
                      type="button"
                      className="flex h-9 w-9 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                      draggable
                      aria-label="拖拽调整顺序"
                      onDragStart={(event) => handleDragStart(event, child.id)}
                      onDragEnd={handleDragEnd}
                    >
                      ↕
                    </button>
                    <label className="flex h-9 items-center gap-2 rounded-md px-2 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelection(child.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        aria-label="选中子 TODO"
                      />
                      选择
                    </label>
                    <div className="flex-1">
                      <TodoItem
                        todo={child}
                        depth={depth + 1}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onAddChild={onAddChild}
                        onReorder={onReorder}
                        onBatchComplete={onBatchComplete}
                        onBatchDelete={onBatchDelete}
                        onUpdatePriority={onUpdatePriority}
                        onBatchPriority={onBatchPriority}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = priorityMeta[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${meta.classes}`}
    >
      优先级：{meta.label}
    </span>
  );
}
