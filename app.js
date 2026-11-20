// To-Do List: state lives in one array, the page is rebuilt from it every time.

const STORAGE_KEY = "tasks";

const form = document.getElementById("form");
const input = document.getElementById("text");
const list = document.getElementById("list");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const filtersBox = document.getElementById("filters");
const clearBtn = document.getElementById("clear");

let tasks = load();
let filter = "all"; 

/* ---------- storage ---------- */


function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(data)) return [];
    return data.filter(function (t) {
      return t && typeof t.id === "number" && typeof t.text === "string";
    }).map(function (t) {
      return { id: t.id, text: t.text, done: Boolean(t.done) };
    });
  } catch (e) {
    return [];
  }
}


function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    
  }
}

/* ---------- helpers ---------- */

function newId() {
  let id = Date.now();
  while (tasks.some(function (t) { return t.id === id; })) id++;
  return id;
}

function visibleTasks() {
  if (filter === "active") return tasks.filter(function (t) { return !t.done; });
  if (filter === "done") return tasks.filter(function (t) { return t.done; });
  return tasks;
}

/* ---------- render ---------- */

function render() {
  list.textContent = ""; 

  const shown = visibleTasks();

  shown.forEach(function (t) {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    if (t.done) li.classList.add("done");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = t.done;
    check.dataset.action = "toggle";
    check.setAttribute("aria-label", "Mark \"" + t.text + "\" as done");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = t.text; 

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Delete";
    del.dataset.action = "delete";
    del.setAttribute("aria-label", "Delete \"" + t.text + "\"");

    li.append(check, label, del);
    list.append(li);
  });

  
  empty.hidden = shown.length > 0;
  if (!empty.hidden) {
    empty.textContent =
      tasks.length === 0 ? "No tasks yet. Add your first one above!" : "No tasks in this filter.";
  }

  
  const left = tasks.filter(function (t) { return !t.done; }).length;
  count.textContent = left + (left === 1 ? " task left" : " tasks left");

  
  filtersBox.querySelectorAll("button").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
  });
  clearBtn.disabled = !tasks.some(function (t) { return t.done; });
}

/* ---------- events ---------- */

// Add a task (click on Add or press Enter both submit the form)
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; } // reject empty tasks
  tasks.push({ id: newId(), text: text, done: false });
  input.value = "";
  save();
  render();
  input.focus();
});


list.addEventListener("click", function (e) {
  const action = e.target.dataset.action;
  if (!action) return;
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (action === "delete") {
    tasks = tasks.filter(function (t) { return t.id !== id; });
  } else if (action === "toggle") {
    tasks.forEach(function (t) { if (t.id === id) t.done = !t.done; });
  }
  save();
  render();
});


filtersBox.addEventListener("click", function (e) {
  const f = e.target.dataset.filter;
  if (!f) return;
  filter = f;
  render();
});


clearBtn.addEventListener("click", function () {
  tasks = tasks.filter(function (t) { return !t.done; });
  save();
  render();
});

render();