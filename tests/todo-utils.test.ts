import assert from "node:assert/strict";
import test from "node:test";
import type { Todo } from "../lib/todo-utils";
import {
  filterChildren,
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
