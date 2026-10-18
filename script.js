
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const todayElement = document.getElementById("today");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("taskflow-tasks"));
    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.date === "string" &&
            ["Low", "Medium", "High"].includes(task.priority) &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

const today = new Date();
todayElement.textContent = today.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
});

taskDate.min = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

function saveTasks() {
    try {
        localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Tasks save nahi ho paaye. Browser storage check karein.");
    }
}

function formatDate(dateString) {
    if (!dateString) return "No deadline";

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function renderTasks() {
    const filter = taskFilter.value;

    const filteredTasks = tasks.filter(task => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    taskList.replaceChildren();

    if (filteredTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task above!"
            : "No tasks found in this category.";
        taskList.appendChild(empty);
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("article");
        item.className = "task-item";
        if (task.completed) item.classList.add("completed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");
        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const deadline = document.createElement("p");
        deadline.textContent = "Deadline: " + formatDate(task.date);

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority.toLowerCase();
        priority.textContent = task.priority + " Priority";

        meta.appendChild(priority);
        details.append(title, deadline, meta);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.title);
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        item.append(checkbox, details, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;

    progressText.textContent = progress + "%";
    progressBar.style.width = progress + "%";
    progressBar.setAttribute("aria-valuenow", String(progress));
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const date = taskDate.value;
    const priority = taskPriority.value;

    if (!title || !date) {
        alert("Please enter a task name and deadline.");
        return;
    }

    const newTask = {
        id: (crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString() + Math.random().toString(16).slice(2)),
        title: title,
        date: date,
        priority: priority,
        completed: false
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();

    taskForm.reset();
    taskPriority.value = "Medium";
    taskTitle.focus();
});

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    const shouldDelete = confirm("Are you sure you want to delete this task?");
    if (!shouldDelete) return;

    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

taskFilter.addEventListener("change", renderTasks);

renderTasks();
