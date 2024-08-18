let currentColor = '#333';

document.addEventListener('DOMContentLoaded', loadTasks);

function toggleSection(section) {
    document.getElementById('todoSection').classList.remove('active');
    document.getElementById('doneSection').classList.remove('active');
    document.getElementById('todoBtn').classList.remove('active');
    document.getElementById('doneBtn').classList.remove('active');

    if (section === 'todo') {
        document.getElementById('todoSection').classList.add('active');
        document.getElementById('todoBtn').classList.add('active');
    } else {
        document.getElementById('doneSection').classList.add('active');
        document.getElementById('doneBtn').classList.add('active');
    }
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskType = document.getElementById('taskType').value;
    const taskName = taskInput.value.trim();

    if (taskName === '') return;

    const task = {
        name: taskName,
        type: taskType,
        color: currentColor,
        done: false
    };

    const li = createTaskElement(task);

    document.getElementById('taskList').appendChild(li);
    saveTask(task);
    taskInput.value = '';
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="task-name ${task.done ? 'done' : ''}" style="color: ${task.color}">
            ${task.name} (${task.type})
        </span>
        <div class="task-actions">
            <i class="fas fa-check" onclick="markDone(this)"></i>
            <i class="fas fa-trash" onclick="deleteTask(this)"></i>
            <i class="fas fa-pen" onclick="editTask(this)"></i>
        </div>
    `;
    return li;
}

function deleteTask(element) {
    const taskElement = element.closest('li');
    const taskName = taskElement.querySelector('.task-name').textContent;
    taskElement.remove();
    removeTask(taskName);
}

function editTask(element) {
    const taskNameElement = element.parentElement.previousElementSibling;
    const currentTaskName = taskNameElement.textContent.split(' (')[0];
    const newTaskName = prompt('Edit task name:', currentTaskName);
    
    if (newTaskName && newTaskName !== currentTaskName) {
        taskNameElement.textContent = newTaskName + ` (${taskNameElement.textContent.split(' (')[1]}`;
        updateTask(currentTaskName, newTaskName);
    }
}

function markDone(element) {
    const taskElement = element.closest('li');
    const taskNameElement = taskElement.querySelector('.task-name');
    const taskName = taskNameElement.textContent.split(' (')[0];
    const isDone = taskNameElement.classList.toggle('done');

    if (isDone) {
        moveTaskToDone(taskNameElement.textContent);
    } else {
        moveTaskToTodo(taskNameElement.textContent);
    }

    updateTaskStatus(taskNameElement.textContent, isDone);
}


function moveTaskToDone(taskName) {
    const doneTaskList = document.getElementById('doneTaskList');
    const taskList = document.getElementById('taskList');
    const taskElement = Array.from(taskList.children).find(task => task.querySelector('.task-name').textContent === taskName);

    if (taskElement) {
        doneTaskList.appendChild(taskElement);
    }
}

function moveTaskToTodo(taskName) {
    const taskList = document.getElementById('taskList');
    const doneTaskList = document.getElementById('doneTaskList');
    const taskElement = Array.from(doneTaskList.children).find(task => task.querySelector('.task-name').textContent === taskName);

    if (taskElement) {
        taskList.appendChild(taskElement);
    }
}

function changeColor(color, button) {
    currentColor = color;
    document.getElementById('colorCircle').style.backgroundColor = color;
    document.querySelectorAll('.task-buttons button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');
    const doneTaskList = document.getElementById('doneTaskList');

    tasks.forEach(task => {
        const li = createTaskElement(task);
        if (task.done) {
            doneTaskList.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
    });
}

function removeTask(taskName) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => `${task.name} (${task.type})` !== taskName);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTask(oldName, newName) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (`${task.name} (${task.type})` === oldName) {
            task.name = newName;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskStatus(taskName, isDone) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (`${task.name} (${task.type})` === taskName) {
            task.done = isDone;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));

    if (isDone) {
        const taskType = taskName.match(/\(([^)]+)\)$/)[1];
        if (taskType === 'daily') {
            setTimeout(() => {
                let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                tasks = tasks.map(task => {
                    if (`${task.name} (${task.type})` === taskName) {
                        task.done = false;
                    }
                    return task;
                });
                localStorage.setItem('tasks', JSON.stringify(tasks));
                loadTasks();
            }, 86400000); // 24 hours in milliseconds
        } else if (taskType === 'one-time') {
            setTimeout(() => {
                removeTask(taskName);
                loadTasks();
            }, 86400000); // 24 hours in milliseconds
        }
    }
}

function deleteAllTasks() {
    localStorage.removeItem('tasks');
    document.getElementById('taskList').innerHTML = '';
    document.getElementById('doneTaskList').innerHTML = '';
}

function deleteAllCompletedTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => !task.done);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.getElementById('doneTaskList').innerHTML = '';
}
