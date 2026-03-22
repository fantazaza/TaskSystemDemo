import { state, formatCurrency, formatDate } from '../state.js';
import * as api from '../api.js';
import { openEditModal } from './modal.js';

export function initKanban() {
    setupDragAndDrop();
    state.subscribe(renderTasks);
}

function renderTasks(allTasks) {
    const tasks = allTasks.filter(t => t.status !== 'archived');
    const columns = {
        todo: document.querySelector('#todo-column .task-list'),
        inprogress: document.querySelector('#inprogress-column .task-list'),
        done: document.querySelector('#done-column .task-list')
    };

    Object.values(columns).forEach(col => { if(col) col.replaceChildren(); });

    tasks.forEach(task => {
        const col = columns[task.status];
        if (col) {
            col.appendChild(createTaskCard(task));
        }
    });

    updateCounts(tasks);
}

function updateCounts(tasks) {
    ['todo', 'inprogress', 'done'].forEach(status => {
        const count = tasks.filter(t => t.status === status).length;
        const countBadge = document.querySelector(`#${status}-column .task-count`);
        if (countBadge) countBadge.textContent = count;
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);

    if (task.color) {
        card.style.borderLeft = `4px solid ${task.color}`;
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    if (task.status === 'done') {
        const archiveBtn = document.createElement('button');
        archiveBtn.className = 'action-btn';
        archiveBtn.title = 'Archive Task';
        archiveBtn.innerHTML = '<i class="fa-solid fa-box-archive"></i>';
        archiveBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await api.archiveTask(task.id);
                // Update local state instead of reloading
                const t = state.tasks.find(t => t.id === task.id);
                if (t) Object.assign(t, { originalStatus: t.status, status: 'archived' });
                state.notify();
            } catch (err) {
                console.error("Archive failed", err);
            }
        });
        actionsDiv.appendChild(archiveBtn);
    }

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.title = 'Edit';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(task);
    });
    actionsDiv.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn delete-btn';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await api.deleteTask(task.id);
                // Update state locally
                state.tasks = state.tasks.filter(t => t.id !== task.id);
                state.notify();
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    });
    actionsDiv.appendChild(delBtn);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-card-content';

    const h3 = document.createElement('h3');
    h3.textContent = task.title; // XSS Safe
    contentDiv.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = task.description || 'No details specified'; // XSS Safe
    contentDiv.appendChild(p);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';

    const priceDiv = document.createElement('div');
    priceDiv.className = 'task-price';
    priceDiv.textContent = formatCurrency(task.price);
    metaDiv.appendChild(priceDiv);

    const deadlineDiv = document.createElement('div');
    deadlineDiv.className = 'task-deadline';
    if (task.deadline) {
        const today = new Date();
        const deadlineDate = new Date(task.deadline);
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);
        if (deadlineDate < today) {
            deadlineDiv.style.color = task.status === 'done' ? '#d1d5db' : '#ef4444';
        }
    }
    deadlineDiv.innerHTML = '<i class="fa-regular fa-calendar-check"></i> ';
    deadlineDiv.appendChild(document.createTextNode(formatDate(task.deadline)));
    metaDiv.appendChild(deadlineDiv);

    contentDiv.appendChild(metaDiv);
    card.appendChild(actionsDiv);
    card.appendChild(contentDiv);

    // Drag Events
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        window.draggedTaskId = task.id; // Fallback
        setTimeout(() => card.style.opacity = '0.5', 0);
    });

    card.addEventListener('dragend', () => {
        card.style.opacity = '1';
    });

    return card;
}

function setupDragAndDrop() {
    const kanbanBoard = document.querySelector('.kanban-board');
    if (!kanbanBoard) return;

    kanbanBoard.addEventListener('dragover', (e) => {
        const column = e.target.closest('.column');
        if (column) {
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
                if (taskList) {
                    if (nextSibling) {
                        taskList.insertBefore(draggingCard, nextSibling);
                    } else {
                        taskList.appendChild(draggingCard);
                    }
                }
            }
        }
    });

    kanbanBoard.addEventListener('dragleave', (e) => {
        const column = e.target.closest('.column');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    });

    kanbanBoard.addEventListener('drop', async (e) => {
        const column = e.target.closest('.column');
        if (column) {
            e.preventDefault();
            column.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain') || window.draggedTaskId;
            if (!taskId) return;
            
            const newStatus = column.getAttribute('data-status');
            const task = state.tasks.find(t => t.id === taskId);
            
            if (task && task.status !== newStatus) {
                try {
                    await api.updateTask({ id: taskId, statusOnly: true, status: newStatus });
                    task.status = newStatus;
                    state.notify();
                } catch (err) {
                    console.error("Drop update failed", err);
                    state.notify(); // Revert UI
                }
            } else {
                state.notify(); // Just re-render
            }
        }
    });
}
