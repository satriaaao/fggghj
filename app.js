const STORAGE_KEY = "taskflow.tasks";

const priorityLabels = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const defaultTasks = [
  createTask("Rancang halaman utama aplikasi", "high"),
  createTask("Tulis daftar fitur prioritas", "medium"),
  { ...createTask("Review progres sore ini", "low"), done: true },
];

export function createTask(title, priority = "medium") {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    priority,
    done: false,
    createdAt: new Date().toISOString(),
  };
}

export function deriveStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const active = total - done;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, active, done, completionRate };
}

export function sortTasks(tasks) {
  const priorityWeight = { high: 0, medium: 1, low: 2 };

  return [...tasks].sort((left, right) => {
    if (left.done !== right.done) {
      return Number(left.done) - Number(right.done);
    }

    return priorityWeight[left.priority] - priorityWeight[right.priority];
  });
}

function readTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTask(task, handlers) {
  const item = document.createElement("li");
  item.className = `task-item${task.done ? " done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `Tandai ${task.title} selesai`);
  checkbox.addEventListener("change", () => handlers.toggle(task.id));

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const priority = document.createElement("span");
  priority.className = `priority priority-${task.priority}`;
  priority.textContent = priorityLabels[task.priority];

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Hapus";
  deleteButton.addEventListener("click", () => handlers.remove(task.id));

  item.append(checkbox, title, priority, deleteButton);
  return item;
}

function initApp() {
  const form = document.querySelector("#task-form");
  const titleInput = document.querySelector("#task-title");
  const priorityInput = document.querySelector("#task-priority");
  const taskList = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const clearDone = document.querySelector("#clear-done");
  const totalCount = document.querySelector("#total-count");
  const activeCount = document.querySelector("#active-count");
  const doneCount = document.querySelector("#done-count");
  const completionRate = document.querySelector("#completion-rate");

  let tasks = readTasks();

  const persistAndRender = () => {
    saveTasks(tasks);
    render();
  };

  const handlers = {
    toggle(id) {
      tasks = tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
      persistAndRender();
    },
    remove(id) {
      tasks = tasks.filter((task) => task.id !== id);
      persistAndRender();
    },
  };

  function render() {
    const stats = deriveStats(tasks);
    totalCount.textContent = stats.total;
    activeCount.textContent = stats.active;
    doneCount.textContent = stats.done;
    completionRate.textContent = `${stats.completionRate}%`;

    taskList.replaceChildren(...sortTasks(tasks).map((task) => renderTask(task, handlers)));
    emptyState.classList.toggle("hidden", tasks.length > 0);
    clearDone.disabled = stats.done === 0;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    tasks = [createTask(title, priorityInput.value), ...tasks];
    form.reset();
    priorityInput.value = "medium";
    titleInput.focus();
    persistAndRender();
  });

  clearDone.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.done);
    persistAndRender();
  });

  render();
}

if (typeof document !== "undefined") {
  initApp();
}
