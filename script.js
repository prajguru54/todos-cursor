const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterSelect = document.getElementById('filter');

let tasks = [];

// Function to fetch tasks from the backend
function fetchTasks() {
    console.log('Fetching tasks from the backend...');
    axios.get('http://localhost:3000/tasks')
        .then(response => {
            tasks = response.data;
            console.log('Tasks fetched successfully:', tasks);
            renderTasks();
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        });
}

// Function to render tasks
function renderTasks() {
    console.log('Rendering tasks...');
    taskList.innerHTML = '';
    const filterValue = filterSelect.value;

    tasks.forEach((task) => {
        if (filterValue === 'completed' && !task.completed) return;
        if (filterValue === 'pending' && task.completed) return;

        const li = document.createElement('li');
        li.textContent = task.text;

        if (task.completed) {
            li.classList.add('completed');
        }

        // Checkbox for completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            console.log(`Toggling completion for task ID: ${task.id}`);
            toggleCompletion(task.id);
        };
        li.prepend(checkbox);

        // Date label
        const dateLabel = document.createElement('span');
        dateLabel.className = 'date-label';
        dateLabel.textContent = task.date ? task.date : '';
        li.appendChild(dateLabel);

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit';
        editBtn.onclick = () => {
            console.log(`Editing task ID: ${task.id}`);
            editTask(task.id);
        };
        li.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = () => {
            console.log(`Deleting task ID: ${task.id}`);
            deleteTask(task.id);
        };
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
    console.log('Tasks rendered successfully.');
}

// Function to add a task
addTaskBtn.onclick = () => {
    const taskText = taskInput.value;
    const taskDueDate = taskDate.value;
    if (taskText) {
        console.log(`Adding new task: ${taskText} with date: ${taskDueDate}`);
        axios.post('http://localhost:3000/tasks', { text: taskText, date: taskDueDate })
            .then(response => {
                tasks.push(response.data);
                console.log('Task added successfully:', response.data);
                taskInput.value = '';
                taskDate.value = '';
                renderTasks();
            })
            .catch(error => {
                console.error('Error adding task:', error);
            });
    } else {
        console.warn('Task input is empty. Cannot add task.');
    }
};

// Function to edit a task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newTaskText = prompt('Edit task:', task.text);
    if (newTaskText) {
        console.log(`Updating task ID: ${id} to new text: ${newTaskText}`);
        axios.put(`http://localhost:3000/tasks/${id}`, { text: newTaskText, date: task.date, completed: task.completed })
            .then(response => {
                const index = tasks.findIndex(t => t.id === id);
                tasks[index] = response.data;
                console.log('Task updated successfully:', response.data);
                renderTasks();
            })
            .catch(error => {
                console.error('Error editing task:', error);
            });
    } else {
        console.warn('No new text provided for task edit.');
    }
}

// Function to delete a task
function deleteTask(id) {
    axios.delete(`http://localhost:3000/tasks/${id}`)
        .then(() => {
            tasks = tasks.filter(t => t.id !== id);
            console.log(`Task ID: ${id} deleted successfully.`);
            renderTasks();
        })
        .catch(error => {
            console.error('Error deleting task:', error);
        });
}

// Function to toggle task completion
function toggleCompletion(id) {
    const task = tasks.find(t => t.id === id);
    console.log(`Toggling completion for task ID: ${id}. Current status: ${task.completed}`);
    axios.put(`http://localhost:3000/tasks/${id}`, { ...task, completed: !task.completed })
        .then(response => {
            const index = tasks.findIndex(t => t.id === id);
            tasks[index] = response.data;
            console.log('Task completion toggled successfully:', response.data);
            renderTasks();
        })
        .catch(error => {
            console.error('Error toggling completion:', error);
        });
}

// Filter tasks on change
filterSelect.onchange = () => {
    console.log('Filter changed to:', filterSelect.value);
    renderTasks();
};

// Initial fetch of tasks
fetchTasks();