const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateProgressBar() {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : (completed / total) * 100;
  progressBar.style.width = `${percent}%`;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('draggable', 'true');
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <span contenteditable>${task.text}</span>
      <button class="delete">&times;</button>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      updateProgressBar();
    });

    const span = li.querySelector('span');
    span.addEventListener('blur', () => {
      task.text = span.textContent;
      saveTasks();
    });

    li.querySelector('.delete').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      updateProgressBar();
    });

    // Drag Events
    li.addEventListener('dragstart', () => {
      li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      const items = Array.from(taskList.children);
      tasks = items.map(item => tasks.find(t => t.id == item.dataset.id));
      saveTasks();
    });

    taskList.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text !== '') {
    tasks.push({ text, completed: false, id: Date.now() });
    taskInput.value = '';
    saveTasks();
    renderTasks();
    updateProgressBar();
  }
});

// Dragover reorder
taskList.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const afterElement = [...taskList.children].find(el => {
    const rect = el.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2;
  });
  if (afterElement) {
    taskList.insertBefore(dragging, afterElement);
  } else {
    taskList.appendChild(dragging);
  }
});

renderTasks();
updateProgressBar();
