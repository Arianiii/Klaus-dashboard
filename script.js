const translations = {
    en: {
        "klaus_title": "Klaus",
        "status_online": "Online",
        "ready_for_tasks": "Ready for tasks",
        "dashboard_title": "Klaus Dashboard",
        "todo_column": "To Do",
        "inprogress_column": "In Progress",
        "done_column": "Done",
        "archived_column": "Archived",
        "add_new_task_title": "Add New Task",
        "task_input_placeholder": "Task title...",
        "save_task_btn": "Save",
        "close_modal_btn": "Cancel",
        "add_a_card": "Add a card",
        "welcome_task": "Welcome to your new dashboard!",
        "dnd_task": "You can drag and drop this task",
        "add_task_instruction": "Click 'Add a card' below to start"
    },
    fa: {
        "klaus_title": "کلاوس",
        "status_online": "آنلاین",
        "ready_for_tasks": "آماده برای تسک‌ها",
        "dashboard_title": "داشبورد کلاوس",
        "todo_column": "انجام‌ نشده",
        "inprogress_column": "در حال انجام",
        "done_column": "انجام ‌شده",
        "archived_column": "بایگانی ‌شده",
        "add_new_task_title": "اضافه کردن تسک جدید",
        "task_input_placeholder": "عنوان تسک...",
        "save_task_btn": "ذخیره",
        "close_modal_btn": "انصراف",
        "add_a_card": "افزودن کارت",
        "welcome_task": "به داشبورد جدیدت خوش آمدی!",
        "dnd_task": "می‌توانی این تسک را جابجا کنی",
        "add_task_instruction": "برای شروع، روی 'افزودن کارت' کلیک کن"
    }
};

let tasks = {};

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        const isPlaceholder = element.hasAttribute('placeholder');

        if (translations[lang] && translations[lang][key]) {
            if (isPlaceholder) {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    localStorage.setItem('language', lang);
    feather.replace();
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.dataset.id = task.id;

    const p = document.createElement('p');
    if (task.key) {
        p.dataset.key = task.key;
        const currentLang = localStorage.getItem('language') || 'fa';
        p.textContent = translations[currentLang][task.key];
    } else {
        p.textContent = task.text;
    }
    card.appendChild(p);

    const span = document.createElement('span');
    span.className = 'date';
    span.textContent = task.date;
    card.appendChild(span);
    
    return card;
}

function renderTasks() {
    document.querySelectorAll('.cards-container').forEach(container => {
        container.innerHTML = '\;
    });

    for (const columnId in tasks) {
        const columnElement = document.getElementById(columnId);
        if (columnElement) {
            const container = columnElement.querySelector('.cards-container');
            if (tasks[columnId]) {
                tasks[columnId].forEach(task => {
                    const card = createTaskCard(task);
                    container.appendChild(card);
                });
            }
        }
    }
}

function saveTasks() {
    const boardState = {};
    document.querySelectorAll('.column').forEach(column => {
        const columnId = column.id;
        const container = column.querySelector('.cards-container');
        boardState[columnId] = Array.from(container.querySelectorAll('.card')).map(card => {
            const p = card.querySelector('p');
            return {
                id: card.dataset.id,
                text: p.dataset.key ? null : p.textContent,
                key: p.dataset.key || null,
                date: card.querySelector('.date').textContent
            }
        });
    });
    localStorage.setItem('kanbanBoard', JSON.stringify(boardState));
}

function openTaskModal() {
    const modal = document.getElementById('taskModal');
    const taskInput = document.getElementById('taskInput');
    modal.style.display = 'flex';
    taskInput.focus();
}

function isBoardEmpty(board) {
    if (!board) return true;
    return Object.values(board).every(column => column.length === 0);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Setup & Load Data ---
    const savedLang = localStorage.getItem('language') || 'fa';
    let savedTasks = localStorage.getItem('kanbanBoard');

    const loadTasks = () => {
        if (!savedTasks || isBoardEmpty(JSON.parse(savedTasks))) {
            fetch('tasks.json')
                .then(response => response.json())
                .then(data => {
                    tasks = data;
                    renderTasks();
                    saveTasks(); // Save the fetched tasks to localStorage
                })
                .catch(error => console.error('Error fetching tasks:', error));
        } else {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    };
    
    setLanguage(savedLang);
    loadTasks();

    // --- Modal & Add Task Listeners ---
    const modal = document.getElementById('taskModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskInput = document.getElementById('taskInput');
    document.querySelector('.add-card-btn').addEventListener('click', openTaskModal);
    
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        taskInput.value = '\;
    });

    saveTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                id: `task-${Date.now()}`,
                text: taskText,
                key: null,
                date: new Date().toLocaleDateString('en-CA')
            };
            if (!tasks['todo-column']) tasks['todo-column'] = [];
            tasks['todo-column'].push(newTask);
            renderTasks();
            saveTasks();
            taskInput.value = '\;
            modal.style.display = 'none';
        }
    });
    
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            taskInput.value = '\;
        }
    });

    // --- SortableJS Init ---
    document.querySelectorAll('.cards-container').forEach(container => {
        new Sortable(container, {
            group: 'kanban',
            animation: 150,
            ghostClass: 'sortable-ghost',
            handle: '.card',
            draggable: '.card',
            onEnd: saveTasks
        });
    });
});

