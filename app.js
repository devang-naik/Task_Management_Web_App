const API_URL = "/api/tasks";

const ICON_EDIT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DELETE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
const ICON_SAVE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const ICON_CANCEL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>';

const STATUS_OPTIONS = ["New", "In Progress", "Completed", "On Hold", "Cancelled"];
const PRIORITY_OPTIONS = ["High", "Moderate", "Low"];
const PRIORITY_ORDER = { High: 0, Moderate: 1, Low: 2 };

const addTaskBtn = document.getElementById("add-task-btn");
const tbody = document.getElementById("task-body");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const clearFiltersBtn = document.getElementById("clear-filters-btn");

let editingId = null;
let isNewEntry = false;
let allTasks = [];

async function getTasks() {
  const res = await fetch(API_URL);
  return res.json();
}

async function createTask(task) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

async function updateTask(id, changes) {
  await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (editingId === id) editingId = null;
  await loadTasks();
}

function priorityRank(priority) {
  return PRIORITY_ORDER.hasOwnProperty(priority) ? PRIORITY_ORDER[priority] : PRIORITY_OPTIONS.length;
}

function matchesFilters(task) {
  if (task.id === editingId) return true;

  if (statusFilter.value && task.status !== statusFilter.value) return false;
  if (priorityFilter.value && task.priority !== priorityFilter.value) return false;

  const term = searchInput.value.trim().toLowerCase();
  if (term) {
    const haystack = `${task.name} ${task.description} ${task.assignedTo}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
}

async function loadTasks() {
  allTasks = await getTasks();
  renderTasks();
}

function renderTasks() {
  const sorted = [...allTasks].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  const visible = sorted.filter(matchesFilters);

  tbody.innerHTML = "";
  emptyState.hidden = visible.length > 0;
  emptyState.textContent = allTasks.length > 0
    ? "No tasks match your search or filters."
    : 'No tasks yet. Click "Create Task" to add one.';

  visible.forEach((task, index) => {
    tbody.appendChild(
      task.id === editingId ? buildEditRow(task) : buildReadRow(task, index + 1)
    );
  });
}

function buildReadRow(task, serial) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="col-serial">${serial}</td>
    <td class="col-name">${escapeHtml(task.name) || "-"}</td>
    <td class="col-assigned">${escapeHtml(task.assignedTo) || "-"}</td>
    <td class="col-date">${escapeHtml(task.startDate) || "-"}</td>
    <td class="col-date">${escapeHtml(task.endDate) || "-"}</td>
    <td><span class="badge">${escapeHtml(task.status) || "-"}</span></td>
    <td>${priorityBadge(task.priority)}</td>
    <td class="col-percent">${percentRing(task.percent)}</td>
    <td class="col-desc">${escapeHtml(task.description) || "-"}</td>
    <td class="col-actions"><div class="actions-row"></div></td>
  `;
  const actions = tr.querySelector(".actions-row");

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit-btn";
  editBtn.type = "button";
  editBtn.title = "Edit";
  editBtn.setAttribute("aria-label", "Edit task");
  editBtn.innerHTML = ICON_EDIT;
  editBtn.addEventListener("click", () => {
    editingId = task.id;
    isNewEntry = false;
    renderTasks();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-btn";
  deleteBtn.type = "button";
  deleteBtn.title = "Delete";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.innerHTML = ICON_DELETE;
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  actions.append(editBtn, deleteBtn);
  return tr;
}

function buildEditRow(task) {
  const tr = document.createElement("tr");
  tr.className = "editing";

  const nameCell = cellWithInput(task.name);
  const assignedCell = cellWithInput(task.assignedTo);
  const startCell = cellWithInput(task.startDate, "date");
  const endCell = cellWithInput(task.endDate, "date");
  const descCell = textareaCellWithInput(task.description);
  const statusCell = selectCellWithInput(task.status, STATUS_OPTIONS, "Select status");
  const priorityCell = selectCellWithInput(task.priority, PRIORITY_OPTIONS, "Select priority");
  const percentCell = cellWithInput(task.percent, "number");
  percentCell.input.min = "0";
  percentCell.input.max = "100";
  percentCell.input.step = "1";

  const serialTd = document.createElement("td");
  serialTd.textContent = "-";

  const actionsTd = document.createElement("td");
  actionsTd.className = "col-actions";
  const actionsRow = document.createElement("div");
  actionsRow.className = "actions-row";
  const saveBtn = document.createElement("button");
  saveBtn.className = "icon-btn save-btn";
  saveBtn.type = "button";
  saveBtn.title = "Save";
  saveBtn.setAttribute("aria-label", "Save task");
  saveBtn.innerHTML = ICON_SAVE;
  const requiredCells = [
    nameCell, assignedCell, startCell, endCell, statusCell, priorityCell, percentCell, descCell,
  ];
  saveBtn.addEventListener("click", async () => {
    for (const cell of requiredCells) {
      if (!cell.input.reportValidity()) {
        cell.input.focus();
        return;
      }
    }
    await updateTask(task.id, {
      name: nameCell.input.value.trim(),
      description: descCell.input.value.trim(),
      startDate: startCell.input.value.trim(),
      endDate: endCell.input.value.trim(),
      assignedTo: assignedCell.input.value.trim(),
      status: statusCell.input.value.trim(),
      priority: priorityCell.input.value.trim(),
      percent: percentCell.input.value.trim(),
    });
    editingId = null;
    isNewEntry = false;
    await loadTasks();
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "icon-btn cancel-btn";
  cancelBtn.type = "button";
  cancelBtn.title = "Cancel";
  cancelBtn.setAttribute("aria-label", "Cancel edit");
  cancelBtn.innerHTML = ICON_CANCEL;
  cancelBtn.addEventListener("click", async () => {
    if (isNewEntry) {
      await deleteTask(task.id);
    } else {
      editingId = null;
      renderTasks();
    }
    isNewEntry = false;
  });

  actionsRow.append(saveBtn, cancelBtn);
  actionsTd.append(actionsRow);

  tr.append(
    serialTd, nameCell.td, assignedCell.td, startCell.td, endCell.td,
    statusCell.td, priorityCell.td, percentCell.td, descCell.td, actionsTd
  );
  return tr;
}

function cellWithInput(value, type = "text") {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = type;
  input.required = true;
  input.value = value || "";
  td.appendChild(input);
  return { td, input };
}

function textareaCellWithInput(value) {
  const td = document.createElement("td");
  const textarea = document.createElement("textarea");
  textarea.required = true;
  textarea.rows = 3;
  textarea.value = value || "";
  td.appendChild(textarea);
  return { td, input: textarea };
}

function selectCellWithInput(value, options, placeholderText) {
  const td = document.createElement("td");
  const select = document.createElement("select");
  select.required = true;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = placeholderText;
  placeholder.disabled = true;
  placeholder.hidden = true;
  select.appendChild(placeholder);

  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });

  select.value = value || "";
  td.appendChild(select);
  return { td, input: select };
}

function priorityBadge(value) {
  if (!PRIORITY_OPTIONS.includes(value)) {
    return `<span class="badge">-</span>`;
  }
  return `<span class="badge badge-priority-${value.toLowerCase()}">${value}</span>`;
}

function percentRing(value) {
  const parsed = parseInt(value, 10);
  const pct = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  return `
    <span class="progress-ring" style="--pct:${pct}">
      <span class="progress-ring-value">${pct}%</span>
    </span>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

addTaskBtn.addEventListener("click", async () => {
  const blank = await createTask({
    name: "", description: "", startDate: "", endDate: "",
    assignedTo: "", status: "", priority: "", percent: "",
  });
  editingId = blank.id;
  isNewEntry = true;
  await loadTasks();
});

function populateFilterOptions(select, options) {
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

populateFilterOptions(statusFilter, STATUS_OPTIONS);
populateFilterOptions(priorityFilter, PRIORITY_OPTIONS);

searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "";
  priorityFilter.value = "";
  renderTasks();
});

loadTasks();
