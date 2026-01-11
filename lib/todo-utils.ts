export type Priority = "high" | "medium" | "low";

export type ChildFilter = "all" | "active" | "completed";
export type PriorityFilter = "all" | Priority;

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority: Priority;
  children: Todo[];
};

export const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const setCompletionDeep = (todo: Todo, completed: boolean): Todo => ({
  ...todo,
  completed,
  children: todo.children.map((child) => setCompletionDeep(child, completed)),
});

export const reconcileCompletion = (todo: Todo): Todo => {
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

export const reconcileTree = (list: Todo[]): Todo[] =>
  list.map((todo) => {
    const nextChildren = reconcileTree(todo.children);
    return reconcileCompletion({ ...todo, children: nextChildren });
  });

export const normalizeTodos = (raw: unknown): Todo[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    id: typeof item?.id === "string" ? item.id : generateId(),
    title: typeof item?.title === "string" ? item.title : "未命名待办",
    completed: Boolean((item as { completed?: boolean })?.completed),
    createdAt:
      typeof item?.createdAt === "string"
        ? (item.createdAt as string)
        : new Date().toISOString(),
    priority:
      (["high", "medium", "low"] as const).includes(
        (item as { priority?: Priority })?.priority ?? "medium",
      )
        ? ((item as { priority?: Priority })?.priority as Priority)
        : "medium",
    children: normalizeTodos((item as { children?: unknown })?.children ?? []),
  }));
};

export const updateTodos = (
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

export const deleteTodo = (list: Todo[], targetId: string): [Todo[], boolean] => {
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

export const reorderWithinParent = (
  list: Todo[],
  parentId: string,
  sourceId: string,
  targetId: string,
): [Todo[], boolean] => {
  let changed = false;

  const next = list.map((todo) => {
    if (todo.id === parentId) {
      const children = [...todo.children];
      const sourceIndex = children.findIndex((child) => child.id === sourceId);
      const targetIndex = children.findIndex((child) => child.id === targetId);

      if (
        sourceIndex !== -1 &&
        targetIndex !== -1 &&
        sourceIndex !== targetIndex
      ) {
        const [moved] = children.splice(sourceIndex, 1);
        const adjustedTarget =
          sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        children.splice(adjustedTarget, 0, moved);
        changed = true;
        return reconcileCompletion({ ...todo, children });
      }

      return todo;
    }

    const [childList, childChanged] = reorderWithinParent(
      todo.children,
      parentId,
      sourceId,
      targetId,
    );

    if (childChanged) {
      changed = true;
      return reconcileCompletion({ ...todo, children: childList });
    }

    return todo;
  });

  return [changed ? next : list, changed];
};

export const completeChildrenBatch = (
  list: Todo[],
  parentId: string,
  childIds: Set<string>,
): [Todo[], boolean] => {
  let changed = false;

  const next = list.map((todo) => {
    if (todo.id === parentId) {
      const children = todo.children.map((child) => {
        if (!childIds.has(child.id)) return child;
        changed = true;
        return setCompletionDeep({ ...child, completed: true }, true);
      });

      return reconcileCompletion({ ...todo, children });
    }

    const [childList, childChanged] = completeChildrenBatch(
      todo.children,
      parentId,
      childIds,
    );

    if (childChanged) {
      changed = true;
      return reconcileCompletion({ ...todo, children: childList });
    }

    return todo;
  });

  return [changed ? next : list, changed];
};

export const deleteChildrenBatch = (
  list: Todo[],
  parentId: string,
  childIds: Set<string>,
): [Todo[], boolean] => {
  let changed = false;

  const next = list
    .map((todo) => {
      if (todo.id === parentId) {
        const children = todo.children.filter((child) => {
          const keep = !childIds.has(child.id);
          if (!keep) changed = true;
          return keep;
        });
        return reconcileCompletion({ ...todo, children });
      }

      const [childList, childChanged] = deleteChildrenBatch(
        todo.children,
        parentId,
        childIds,
      );

      if (childChanged) {
        changed = true;
        return reconcileCompletion({ ...todo, children: childList });
      }

      return todo;
    })
    .filter(Boolean) as Todo[];

  return [changed ? next : list, changed];
};

export const updateChildrenPriorityBatch = (
  list: Todo[],
  parentId: string,
  childIds: Set<string>,
  priority: Priority,
): [Todo[], boolean] => {
  let changed = false;

  const next = list.map((todo) => {
    if (todo.id === parentId) {
      const children = todo.children.map((child) => {
        if (!childIds.has(child.id)) return child;
        changed = true;
        return { ...child, priority };
      });
      return reconcileCompletion({ ...todo, children });
    }

    const [childList, childChanged] = updateChildrenPriorityBatch(
      todo.children,
      parentId,
      childIds,
      priority,
    );

    if (childChanged) {
      changed = true;
      return reconcileCompletion({ ...todo, children: childList });
    }

    return todo;
  });

  return [changed ? next : list, changed];
};

export const collectStats = (
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

export const filterChildren = (
  children: Todo[],
  childFilter: ChildFilter,
  searchTerm: string,
  priorityFilter: PriorityFilter = "all",
): Todo[] => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  return children.filter((child) => {
    const matchesFilter =
      childFilter === "all" ||
      (childFilter === "active" && !child.completed) ||
      (childFilter === "completed" && child.completed);
    const matchesPriority =
      priorityFilter === "all" || child.priority === priorityFilter;
    const matchesSearch =
      !normalizedSearch || child.title.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesPriority && matchesSearch;
  });
};
