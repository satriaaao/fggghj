import test from "node:test";
import assert from "node:assert/strict";

import { createTask, deriveStats, sortTasks } from "../app.js";

test("createTask normalizes title and defaults priority", () => {
  const task = createTask("  Tulis rencana aplikasi  ");

  assert.equal(task.title, "Tulis rencana aplikasi");
  assert.equal(task.priority, "medium");
  assert.equal(task.done, false);
  assert.ok(task.id);
  assert.ok(task.createdAt);
});

test("deriveStats calculates active, done, and completion rate", () => {
  const stats = deriveStats([
    { done: true },
    { done: false },
    { done: true },
  ]);

  assert.deepEqual(stats, {
    total: 3,
    active: 1,
    done: 2,
    completionRate: 67,
  });
});

test("sortTasks keeps active high-priority work first", () => {
  const tasks = [
    { id: "done-high", priority: "high", done: true },
    { id: "active-low", priority: "low", done: false },
    { id: "active-high", priority: "high", done: false },
  ];

  assert.deepEqual(
    sortTasks(tasks).map((task) => task.id),
    ["active-high", "active-low", "done-high"],
  );
});
