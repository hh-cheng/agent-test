import assert from "node:assert/strict";
import test from "node:test";
import type { Todo } from "../lib/todo-utils";
import {
  buildCsvFromTodos,
  filterChildren,
  flattenTodosForExport,
  updateChildrenPriorityBatch,
} from "../lib/todo-utils";

const baseDate = "2024-01-01T00:00:00.000Z";

const createChild = (
  id: string,
  overrides: Partial<Todo> = {},
): Todo => ({
  id,
  title: `child-${id}`,
  completed: false,
  createdAt: baseDate,
  priority: "medium",
  children: [],
  ...overrides,
});

const createParent = (children: Todo[]): Todo => ({
  id: "parent-1",
  title: "parent",
  completed: false,
  createdAt: baseDate,
  priority: "medium",
  children,
});

test("updateChildrenPriorityBatch updates matching children and returns new list", () => {
  const list = [
    createParent([
      createChild("a", { priority: "low" }),
      createChild("b", { priority: "medium" }),
    ]),
  ];

  const [next, changed] = updateChildrenPriorityBatch(
    list,
    "parent-1",
    new Set(["a", "b"]),
    "high",
  );

  assert.equal(changed, true);
  assert.notStrictEqual(next, list);
  assert.equal(next[0].children[0].priority, "high");
  assert.equal(next[0].children[1].priority, "high");
});

test("updateChildrenPriorityBatch is stable when no ids are provided", () => {
  const list = [
    createParent([
      createChild("a", { priority: "medium" }),
      createChild("b", { priority: "low" }),
    ]),
  ];

  const [next, changed] = updateChildrenPriorityBatch(
    list,
    "parent-1",
    new Set(),
    "high",
  );

  assert.equal(changed, false);
  assert.strictEqual(next, list);
  assert.equal(list[0].children[0].priority, "medium");
  assert.equal(list[0].children[1].priority, "low");
});

test("updateChildrenPriorityBatch ignores missing parent ids", () => {
  const list = [
    createParent([createChild("a", { priority: "low" })]),
    createParent([createChild("b", { priority: "high" })]),
  ];

  const [next, changed] = updateChildrenPriorityBatch(
    list,
    "absent-parent",
    new Set(["a"]),
    "medium",
  );

  assert.equal(changed, false);
  assert.strictEqual(next, list);
  assert.equal(list[0].children[0].priority, "low");
  assert.equal(list[1].children[0].priority, "high");
});

test("filterChildren combines filter and search terms", () => {
  const children: Todo[] = [
    createChild("a", { title: "Write docs" }),
    createChild("b", { title: "Ship code", completed: true }),
    createChild("c", { title: "write tests" }),
  ];

  const activeWrite = filterChildren(children, "active", " write ");
  assert.deepEqual(
    activeWrite.map((child) => child.id),
    ["a", "c"],
  );

  const completedWrite = filterChildren(children, "completed", "write");
  assert.deepEqual(
    completedWrite.map((child) => child.id),
    [],
  );

  const allShip = filterChildren(children, "all", "ship");
  assert.deepEqual(
    allShip.map((child) => child.id),
    ["b"],
  );
});

test("filterChildren applies priority filter together with other criteria", () => {
  const children: Todo[] = [
    createChild("a", { title: "Write docs", priority: "high" }),
    createChild("b", { title: "Ship code", completed: true, priority: "low" }),
    createChild("c", { title: "Write tests", priority: "high" }),
  ];

  const highPriorityActive = filterChildren(children, "active", "", "high");
  assert.deepEqual(
    highPriorityActive.map((child) => child.id),
    ["a", "c"],
  );

  const completedLow = filterChildren(children, "completed", "", "low");
  assert.deepEqual(completedLow.map((child) => child.id), ["b"]);

  const searchNarrows = filterChildren(
    children,
    "all",
    "tests",
    "high",
  );
  assert.deepEqual(searchNarrows.map((child) => child.id), ["c"]);
});

test("flattenTodosForExport returns empty rows for empty list", () => {
  const rows = flattenTodosForExport([]);
  assert.deepEqual(rows, []);
});

test("flattenTodosForExport captures top-level todos", () => {
  const list: Todo[] = [
    {
      id: "p1",
      title: "Parent only",
      completed: false,
      createdAt: baseDate,
      priority: "medium",
      children: [],
    },
  ];

  const rows = flattenTodosForExport(list);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    id: "p1",
    title: "Parent only",
    parentId: null,
    parentTitle: null,
    completed: false,
    priority: "medium",
    createdAt: baseDate,
    depth: 0,
    path: "Parent only",
  });
});

test("flattenTodosForExport keeps parent chain for nested todos", () => {
  const list: Todo[] = [
    {
      id: "p1",
      title: "Top",
      completed: false,
      createdAt: baseDate,
      priority: "high",
      children: [
        {
          id: "c1",
          title: 'Child,One "quoted"',
          completed: true,
          createdAt: baseDate,
          priority: "low",
          children: [
            {
              id: "g1",
              title: "Grandchild",
              completed: false,
              createdAt: baseDate,
              priority: "medium",
              children: [],
            },
          ],
        },
        {
          id: "c2",
          title: "Second child",
          completed: false,
          createdAt: baseDate,
          priority: "medium",
          children: [],
        },
      ],
    },
  ];

  const rows = flattenTodosForExport(list);
  assert.equal(rows.length, 4);

  const childRow = rows.find((row) => row.id === "c1");
  assert(childRow, "child row should exist");
  assert.equal(childRow?.parentId, "p1");
  assert.equal(childRow?.path, 'Top > Child,One "quoted"');
  assert.equal(childRow?.depth, 1);

  const grandChildRow = rows.find((row) => row.id === "g1");
  assert(grandChildRow, "grandchild row should exist");
  assert.equal(grandChildRow?.parentId, "c1");
  assert.equal(grandChildRow?.parentTitle, 'Child,One "quoted"');
  assert.equal(grandChildRow?.path, 'Top > Child,One "quoted" > Grandchild');
  assert.equal(grandChildRow?.depth, 2);
});

test("buildCsvFromTodos escapes commas and quotes and includes hierarchy", () => {
  const list: Todo[] = [
    {
      id: "p1",
      title: "Root",
      completed: false,
      createdAt: baseDate,
      priority: "high",
      children: [
        {
          id: "c1",
          title: 'Child,One "quoted"',
          completed: true,
          createdAt: baseDate,
          priority: "low",
          children: [],
        },
      ],
    },
  ];

  const csv = buildCsvFromTodos(list);
  const lines = csv.split("\n");

  assert.equal(
    lines[0],
    "level,path,parentId,parentTitle,id,title,priority,completed,createdAt",
  );
  assert.equal(lines.length, 3);

  const childLine = lines.find((line) => line.includes("c1"));
  assert(childLine, "child csv row should exist");
  assert(
    childLine?.includes('"Root > Child,One ""quoted"""'),
    "path should be quoted and escaped",
  );
  assert(
    childLine?.includes('"Child,One ""quoted"""'),
    "title should escape embedded quotes and comma",
  );
  assert(
    childLine?.includes("true"),
    "completed flag should be included in csv row",
  );
});
