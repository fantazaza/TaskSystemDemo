/* 
 * PRODUCT: Freelance Task Manager (Desktop)
 * AUTHOR: Your Name (CodeCanyon Profile Link)
 * VERSION: 1.0.0
 * LICENSE: Envato Standard License
 */

const { ipcRenderer } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

async function initDB() {
    const userDataPath = await ipcRenderer.invoke('get-user-data-path');
    const dbPath = path.join(userDataPath, 'tasksystemDB.db');
    db = new sqlite3.Database(dbPath);

    return new Promise((resolve) => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                price TEXT,
                deadline TEXT,
                status TEXT,
                createdAt TEXT,
                color TEXT
            )`);

            // Add color column if it doesn't exist (for existing DBs)
            db.run(`ALTER TABLE tasks ADD COLUMN color TEXT`, (err) => {
                resolve();
            });
        });
    });
}

// State management
let tasks = [];

// DOM Elements
const taskModal = document.getElementById('taskModal');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');

// Archive Elements
const archiveModal = document.getElementById('archiveModal');
const viewArchiveBtn = document.getElementById('viewArchiveBtn');
const closeArchiveBtn = document.getElementById('closeArchiveBtn');
const clearArchiveBtn = document.getElementById('clearArchiveBtn');
const archiveList = document.getElementById('archiveList');
const archiveCount = document.getElementById('archiveCount');

// Form Inputs
const inputId = document.getElementById('taskId');
const inputTitle = document.getElementById('taskTitle');
const inputDesc = document.getElementById('taskDesc');
const inputPrice = document.getElementById('taskPrice');
const inputDeadline = document.getElementById('taskDeadline');
const deadlineDisplay = document.getElementById('deadlineDisplay');
const inputStatus = document.getElementById('taskStatus');
const inputColor = document.getElementById('taskColor');

if (inputDeadline) {
    inputDeadline.addEventListener('change', () => {
        if (inputDeadline.value) {
            const date = new Date(inputDeadline.value);
            deadlineDisplay.textContent = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            deadlineDisplay.textContent = 'Select Deadline';
        }
    });
}

// View Elements
const kanbanViewBtn = document.getElementById('kanbanViewBtn');
const calendarViewBtn = document.getElementById('calendarViewBtn');
const kanbanView = document.getElementById('kanbanView');
const calendarView = document.getElementById('calendarView');

// Calendar Elements
const calendarMonth = document.getElementById('calendarMonth');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const todayBtn = document.getElementById('todayBtn');

// Insights Elements
const insightsViewBtn = document.getElementById('insightsViewBtn');
const insightsView = document.getElementById('insightsView');
const statEarnedRevenue = document.getElementById('statEarnedRevenue');
const statPendingRevenue = document.getElementById('statPendingRevenue');
const statTasksDone = document.getElementById('statTasksDone');
const statSuccessRate = document.getElementById('statSuccessRate');
const statusStack = document.getElementById('statusStack');
const statusLegend = document.getElementById('statusLegend');
const revenueBreakdown = document.getElementById('revenueBreakdown');

let currentView = 'kanban';
let currentPeriod = 'all'; // Default period
let calendarDate = new Date();

// Initialize App
async function init() {
    await initDB();
    loadTasksFromDB();
    setupDragAndDrop();
    setupViewSwitch();
    setupCalendarNav();
    setupPeriodSelector();
}

function loadTasksFromDB() {
    db.all("SELECT * FROM tasks WHERE status != 'archived'", [], (err, rows) => {
        if (err) {
            console.error("Error loading tasks:", err);
            return;
        }
        tasks = rows;
        renderTasks();
    });
}

// Generate unique ID
function generateId() {
    return crypto.randomUUID();
}

// Format Currency
function formatCurrency(amount) {
    if (!amount) return '$0';
    return '$' + parseFloat(amount).toLocaleString('en-US');
}

// Format Date
function formatDate(dateStr) {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Render Tasks
function renderTasks() {
    // Clear columns
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        const column = document.querySelector(`#${task.status}-column .task-list`);
        if (column) {
            column.appendChild(createTaskCard(task));
        }
    });

    updateCounts();
    renderCalendar();
    updateInsights();
}

// Render Calendar
function renderCalendar() {
    calendarDays.innerHTML = '';
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Set Header
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarDate);
    calendarMonth.textContent = monthName;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Previous month days to fill the first row
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const dayDiv = createDayElement(prevMonthDays - i, true);
        calendarDays.appendChild(dayDiv);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        const dayDiv = createDayElement(i, false, isToday);
        
        // Find tasks for this day
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTasks = tasks.filter(t => t.deadline === dayStr);
        
        if (dayTasks.length > 0) {
            const taskContainer = dayDiv.querySelector('.calendar-tasks');
            dayTasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `cal-task-item cal-task-${task.status}`;
                taskItem.textContent = task.title;
                taskItem.title = task.title;
                taskItem.setAttribute('draggable', 'true');
                taskItem.setAttribute('data-id', task.id);
                
                if (task.color) {
                    taskItem.style.borderLeftColor = task.color;
                    taskItem.style.backgroundColor = task.color + '22'; // low opacity background
                }

                taskItem.onclick = (e) => {
                    e.stopPropagation();
                    openEditModal(task.id);
                };

                // Calendar Drag Events
                taskItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.setData('source', 'calendar');
                    setTimeout(() => taskItem.style.opacity = '0.4', 0);
                });
                taskItem.addEventListener('dragend', () => taskItem.style.opacity = '1');

                taskContainer.appendChild(taskItem);
            });
        }
        
        calendarDays.appendChild(dayDiv);
    }

    // Remaining days to fill the grid (total 42 cells)
    const totalCells = 42;
    const remainingCells = totalCells - calendarDays.children.length;
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = createDayElement(i, true);
        calendarDays.appendChild(dayDiv);
    }
}

function createDayElement(dayNumber, isOtherMonth, isToday = false) {
    const div = document.createElement('div');
    div.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
    
    const year = calendarDate.getFullYear();
    const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
    const day = String(dayNumber).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    
    div.setAttribute('data-date', fullDate);
    div.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        <div class="calendar-tasks"></div>
    `;
    
    if (!isOtherMonth) {
        div.onclick = () => {
            inputDeadline.value = fullDate;
            openModal(false);
        };
        
        // Calendar Drop logic
        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            div.classList.add('drag-over-cal');
        });
        
        div.addEventListener('dragleave', () => div.classList.remove('drag-over-cal'));
        
        div.addEventListener('drop', (e) => {
            e.preventDefault();
            div.classList.remove('drag-over-cal');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const newDate = div.getAttribute('data-date');
            
            db.run(`UPDATE tasks SET deadline = ? WHERE id = ?`, [newDate, taskId], (err) => {
                if (err) console.error(err);
                loadTasksFromDB();
            });
        });
    }
    
    return div;
}

function setupViewSwitch() {
    kanbanViewBtn.addEventListener('click', () => switchView('kanban'));
    calendarViewBtn.addEventListener('click', () => switchView('calendar'));
    insightsViewBtn.addEventListener('click', () => switchView('insights'));
}

function switchView(view) {
    currentView = view;
    // Reset view buttons
    kanbanViewBtn.classList.remove('active');
    calendarViewBtn.classList.remove('active');
    insightsViewBtn.classList.remove('active');
    
    // Hide all
    kanbanView.classList.add('hidden');
    calendarView.classList.add('hidden');
    insightsView.classList.add('hidden');

    if (view === 'kanban') {
        kanbanView.classList.remove('hidden');
        kanbanViewBtn.classList.add('active');
    } else if (view === 'calendar') {
        calendarView.classList.remove('hidden');
        calendarViewBtn.classList.add('active');
        renderCalendar();
    } else if (view === 'insights') {
        insightsView.classList.remove('hidden');
        insightsViewBtn.classList.add('active');
        updateInsights();
    }
}

function setupCalendarNav() {
    prevMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });
    todayBtn.addEventListener('click', () => {
        calendarDate = new Date();
        renderCalendar();
    });
}

// Update Task Counts
function updateCounts() {
    ['todo', 'inprogress', 'done'].forEach(status => {
        const count = tasks.filter(t => t.status === status).length;
        const countBadge = document.querySelector(`#${status}-column .task-count`);
        if (countBadge) countBadge.textContent = count;
    });
}

// Create Task Element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);

    // Current Date check for urgency
    let dateClass = '';
    if (task.deadline) {
        const today = new Date();
        const deadlineDate = new Date(task.deadline);
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today && task.status !== 'done') {
            dateClass = 'style="color: #ef4444;"'; // overdue
        }
    }

    const colorStyle = task.color ? `border-left: 4px solid ${task.color};` : '';

    card.innerHTML = `
        <div class="task-actions">
            ${task.status === 'done' ? `<button class="action-btn" onclick="archiveTask('${task.id}')" title="Archive Task"><i class="fa-solid fa-box-archive"></i></button>` : ''}
            <button class="action-btn edit-btn" onclick="openEditModal('${task.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="task-card-content" style="${colorStyle}">
            <h3>${task.title}</h3>
            <p>${task.description || 'No details specified'}</p>
            <div class="task-meta">
                <div class="task-price">${formatCurrency(task.price)}</div>
                <div class="task-deadline" ${dateClass}><i class="fa-regular fa-calendar-check"></i> ${formatDate(task.deadline)}</div>
            </div>
        </div>
    `;

    // Drag Events
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        setTimeout(() => card.style.opacity = '0.5', 0);
    });

    card.addEventListener('dragend', () => {
        card.style.opacity = '1';
    });

    return card;
}

// Modal Handlers
function openModal(isEdit = false) {
    taskModal.classList.remove('hidden');
    if (!isEdit) {
        taskForm.reset();
        inputId.value = '';
        modalTitle.textContent = 'Add New Task';
        deadlineDisplay.textContent = 'Select Deadline'; // Reset display
    } else {
        modalTitle.textContent = 'Edit Task';
    }
}

function closeModal() {
    taskModal.classList.add('hidden');
    setTimeout(() => taskForm.reset(), 300);
}

// Edit Task
window.openEditModal = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        inputId.value = task.id;
        inputTitle.value = task.title;
        inputDesc.value = task.description;
        inputPrice.value = task.price;
        inputDeadline.value = task.deadline || '';
        inputStatus.value = task.status;
        inputColor.value = task.color || '#5c9e78';
        
        // Update deadline display
        if (task.deadline) {
            const date = new Date(task.deadline);
            deadlineDisplay.textContent = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            deadlineDisplay.textContent = 'Select Deadline';
        }

        openModal(true);
    }
}

// Delete Task
window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(err) {
            if (err) console.error(err);
            loadTasksFromDB();
        });
    }
}

// Archive Task
window.archiveTask = function(id) {
    db.run(`UPDATE tasks SET status = 'archived' WHERE id = ?`, [id], function(err) {
        if (err) console.error(err);
        loadTasksFromDB();
    });
}

// Form Submission
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const priceValue = parseFloat(inputPrice.value) || 0;
    if (priceValue < 0) {
        alert("Price cannot be negative.");
        return;
    }

    const taskData = {
        id: inputId.value || generateId(),
        title: inputTitle.value,
        description: inputDesc.value,
        price: priceValue.toString(),
        deadline: inputDeadline.value,
        status: inputStatus.value,
        color: inputColor.value,
        createdAt: new Date().toISOString()
    };

    if (inputId.value) {
        db.run(`UPDATE tasks SET title = ?, description = ?, price = ?, deadline = ?, status = ?, color = ? WHERE id = ?`, 
            [taskData.title, taskData.description, taskData.price, taskData.deadline, taskData.status, taskData.color, taskData.id], 
            function(err) {
                if (err) console.error(err);
                loadTasksFromDB();
                closeModal();
            });
    } else {
        db.run(`INSERT INTO tasks (id, title, description, price, deadline, status, createdAt, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [taskData.id, taskData.title, taskData.description, taskData.price, taskData.deadline, taskData.status, taskData.createdAt, taskData.color], 
            function(err) {
                if (err) console.error(err);
                loadTasksFromDB();
                closeModal();
            });
    }
});

// Drag and Drop Logic
function setupDragAndDrop() {
    const columns = document.querySelectorAll('.column');

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
            
            const draggingCard = document.querySelector('.task-card[style*="opacity: 0.5"]');
            if (draggingCard) {
                const dropY = e.clientY;
                const siblings = [...column.querySelectorAll('.task-card:not([style*="opacity: 0.5"])')];
                
                const nextSibling = siblings.find(sibling => {
                    const rect = sibling.getBoundingClientRect();
                    return dropY <= rect.top + rect.height / 2;
                });
                
                const taskList = column.querySelector('.task-list');
                if (nextSibling) {
                    taskList.insertBefore(draggingCard, nextSibling);
                } else {
                    taskList.appendChild(draggingCard);
                }
            }
        });

        column.addEventListener('dragleave', () => column.classList.remove('drag-over'));

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const newStatus = column.getAttribute('data-status');

            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1 && tasks[taskIndex].status !== newStatus) {
                db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [newStatus, taskId], function(err) {
                    if (err) console.error(err);
                    loadTasksFromDB();
                });
            } else {
                renderTasks();
            }
        });
    });
}

// Archive Logic
function loadArchive(dateFilter = null) {
    let query = "SELECT * FROM tasks WHERE status = 'archived'";
    let params = [];
    
    if (dateFilter) {
        // Use strftime for robust YYYY-MM-DD comparison
        query += " AND strftime('%Y-%m-%d', createdAt) = ?";
        params.push(dateFilter);
    }
    
    query += " ORDER BY createdAt DESC";

    db.all(query, params, (err, rows) => {
        if (err) return console.error(err);
        
        archiveList.innerHTML = '';
        archiveCount.textContent = rows.length;

        if (rows.length === 0) {
            archiveList.innerHTML = `<div class="archive-empty">${dateFilter ? 'No tasks found for selected date' : 'Archive is empty'}</div>`;
            return;
        }

        rows.forEach(task => {
            const div = document.createElement('div');
            div.className = 'archive-item';
            if (task.color) {
                div.style.borderLeft = `5px solid ${task.color}`;
            }
            div.innerHTML = `
                <div class="archive-item-info">
                    <h4>${task.title}</h4>
                    <span>Completed: ${formatDate(task.createdAt)}</span>
                </div>
                <div class="archive-item-price">${formatCurrency(task.price)}</div>
            `;
            archiveList.appendChild(div);
        });
    });
}

// Archive Filter Elements
const archiveDateFilter = document.getElementById('archiveDateFilter');
const archiveDateDisplay = document.getElementById('archiveDateDisplay');
const resetArchiveFilter = document.getElementById('resetArchiveFilter');

if (archiveDateFilter) {
    archiveDateFilter.addEventListener('change', () => {
        const dateValue = archiveDateFilter.value;
        if (dateValue) {
            const date = new Date(dateValue);
            archiveDateDisplay.textContent = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            archiveDateDisplay.textContent = 'Select Date';
        }
        loadArchive(dateValue);
    });
}

if (resetArchiveFilter) {
    resetArchiveFilter.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents triggering the date picker
        archiveDateFilter.value = '';
        archiveDateDisplay.textContent = 'Select Date';
        loadArchive();
    });
}

viewArchiveBtn.addEventListener('click', () => {
    loadArchive();
    archiveModal.classList.remove('hidden');
});

closeArchiveBtn.addEventListener('click', () => {
    archiveModal.classList.add('hidden');
});

clearArchiveBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to permanently delete all archived tasks? This action cannot be undone.')) {
        db.run(`DELETE FROM tasks WHERE status = 'archived'`, [], function(err) {
            if (err) return console.error(err);
            loadArchive();
        });
    }
});

// Event Listeners
const archiveAllBtn = document.getElementById('archiveAllBtn');
if (archiveAllBtn) {
    archiveAllBtn.addEventListener('click', () => {
        if (confirm('Move all completed tasks to archive?')) {
            db.run(`UPDATE tasks SET status = 'archived' WHERE status = 'done'`, [], function(err) {
                if (err) console.error(err);
                loadTasksFromDB();
            });
        }
    });
}

// Handle Color Presets
document.querySelectorAll('.preset').forEach(preset => {
    preset.addEventListener('click', () => {
        const color = preset.getAttribute('data-color');
        if (inputColor) inputColor.value = color;
    });
});

addTaskBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === taskModal) closeModal();
    if (e.target === archiveModal) archiveModal.classList.add('hidden');
});

// Archive Picker Wrapper Logic
window.openArchivePicker = function() {
    const picker = document.getElementById('archiveDateFilter');
    if (picker) {
        try {
            // Modern API for opening picker programmatically
            if (typeof picker.showPicker === 'function') {
                picker.showPicker();
            } else {
                picker.click(); // Fallback for older browsers
            }
        } catch (e) {
            picker.click();
        }
    }
}

// Setup Period Selector
function setupPeriodSelector() {
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.getAttribute('data-period');
            updateInsights();
        });
    });
}

// Export Data to CSV
function exportTasksToCSV() {
    db.all("SELECT * FROM tasks", [], (err, allTasks) => {
        if (err) return console.error(err);
        
        if (allTasks.length === 0) {
            alert('No tasks to export.');
            return;
        }

        const headers = ["ID", "Title", "Description", "Price ($)", "Deadline", "Status", "Created At", "Color"];
        const rows = allTasks.map(t => [
            t.id,
            `"${t.title.replace(/"/g, '""')}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.price || 0,
            t.deadline || 'N/A',
            t.status,
            t.createdAt,
            t.color || '#5c9e78'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", `task_manager_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportTasksToCSV);

// Update Insights Dashboard
function updateInsights() {
    // Query ALL tasks to get complete stats
    db.all("SELECT * FROM tasks", [], (err, allTasks) => {
        if (err) return console.error(err);

        // Period Filtering Logic
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let filteredTasks = allTasks;
        
        if (currentPeriod !== 'all') {
            filteredTasks = allTasks.filter(t => {
                const created = new Date(t.createdAt);
                if (currentPeriod === 'today') return created >= startOfToday;
                if (currentPeriod === 'week') return created >= startOfWeek;
                if (currentPeriod === 'month') return created >= startOfMonth;
                if (currentPeriod === 'year') return created >= startOfYear;
                return true;
            });
        }

        // Core Stats based on filtered tasks
        const doneTasks = filteredTasks.filter(t => t.status === 'done' || t.status === 'archived');
        const activeTasks = filteredTasks.filter(t => t.status === 'todo' || t.status === 'inprogress');
        
        const earnedRev = doneTasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
        const pendingRev = activeTasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
        
        statEarnedRevenue.textContent = formatCurrency(earnedRev);
        statPendingRevenue.textContent = formatCurrency(pendingRev);
        statTasksDone.innerHTML = `${doneTasks.length} <span>tasks</span>`;
        
        const rate = filteredTasks.length > 0 ? Math.round((doneTasks.length / filteredTasks.length) * 100) : 0;
        statSuccessRate.textContent = `${rate}%`;

        // Status Distribution Bar
        const statusGroups = ['todo', 'inprogress', 'done', 'archived'];
        const colors = { todo: '#94a0ac', inprogress: '#2da2cc', done: '#5c9e78', archived: '#a159d1' };
        
        statusStack.innerHTML = '';
        statusLegend.innerHTML = '';
        
        statusGroups.forEach(status => {
            const groupTasks = filteredTasks.filter(t => t.status === status);
            const percentage = filteredTasks.length > 0 ? (groupTasks.length / filteredTasks.length) * 100 : 0;
            
            if (percentage > 0) {
                const seg = document.createElement('div');
                seg.className = 'stack-seg';
                seg.style.width = `${percentage}%`;
                seg.style.backgroundColor = colors[status];
                seg.title = `${status}: ${groupTasks.length} tasks`;
                statusStack.appendChild(seg);
            }
            
            const legendLabel = status.charAt(0).toUpperCase() + status.slice(1);
            statusLegend.innerHTML += `
                <div class="legend-item">
                    <span class="legend-dot" style="background:${colors[status]}"></span>
                    <span>${legendLabel}</span>
                </div>
            `;
        });

        // Revenue Breakdown
        revenueBreakdown.innerHTML = '';
        statusGroups.forEach(status => {
            const groupTasks = filteredTasks.filter(t => t.status === status);
            const groupRev = groupTasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
            
            revenueBreakdown.innerHTML += `
                <div class="revenue-row">
                    <div class="rev-label">
                        <span class="legend-dot" style="background:${colors[status]}"></span>
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <div class="rev-value">${formatCurrency(groupRev)}</div>
                </div>
            `;
        });
    });
}

// Boot the app
document.addEventListener('DOMContentLoaded', init);
