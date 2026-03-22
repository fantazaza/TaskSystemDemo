import { state, formatCurrency, formatDate } from '../state.js';
import * as api from '../api.js';

const archiveModal = document.getElementById('archiveModal');
const archiveList = document.getElementById('archiveList');
const archiveCount = document.getElementById('archiveCount');
const archiveDateFilter = document.getElementById('archiveDateFilter');
const archiveDateDisplay = document.getElementById('archiveDateDisplay');

export function initArchive() {
    document.getElementById('viewArchiveBtn').addEventListener('click', () => {
        loadArchive();
        archiveModal.classList.remove('hidden');
    });

    document.getElementById('closeArchiveBtn').addEventListener('click', () => {
        archiveModal.classList.add('hidden');
    });

    document.getElementById('clearArchiveBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to permanently delete all archived tasks? This action cannot be undone.')) {
            await api.clearArchive();
            loadArchive();
            state.loadTasks();
        }
    });

    const archiveAllBtn = document.getElementById('archiveAllBtn');
    if (archiveAllBtn) {
        archiveAllBtn.addEventListener('click', async () => {
            if (confirm('Move all completed tasks to archive?')) {
                await api.archiveAllDone();
                state.loadTasks();
            }
        });
    }

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

    const resetArchiveFilter = document.getElementById('resetArchiveFilter');
    if (resetArchiveFilter) {
        resetArchiveFilter.addEventListener('click', (e) => {
            e.stopPropagation();
            archiveDateFilter.value = '';
            archiveDateDisplay.textContent = 'Select Date';
            loadArchive();
        });
    }

    window.openArchivePicker = function() {
        if (archiveDateFilter) {
            try {
                if (typeof archiveDateFilter.showPicker === 'function') {
                    archiveDateFilter.showPicker();
                } else {
                    archiveDateFilter.click();
                }
            } catch (e) {
                archiveDateFilter.click();
            }
        }
    }
}

async function loadArchive(dateFilter = null) {
    const filters = { status: 'archived' };
    if (dateFilter) filters.date = dateFilter;
    
    const rows = await api.getTasks(filters);
    
    archiveList.innerHTML = '';
    archiveCount.textContent = rows.length;

    if (rows.length === 0) {
        const msg = document.createElement('div');
        msg.className = 'archive-empty';
        msg.textContent = dateFilter ? 'No tasks found for selected date' : 'Archive is empty';
        archiveList.appendChild(msg);
        return;
    }

    rows.forEach(task => {
        const div = document.createElement('div');
        div.className = 'archive-item';
        if (task.color) {
            div.style.borderLeft = `5px solid ${task.color}`;
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'archive-item-info';
        
        const h4 = document.createElement('h4');
        h4.textContent = task.title; // XSS Safe
        infoDiv.appendChild(h4);
        
        const span = document.createElement('span');
        span.textContent = `Completed: ${formatDate(task.createdAt)}`;
        infoDiv.appendChild(span);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'archive-item-price-actions';
        
        const priceDiv = document.createElement('div');
        priceDiv.className = 'archive-item-price';
        priceDiv.textContent = formatCurrency(task.price);
        actionsDiv.appendChild(priceDiv);
        
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'action-btn restore-btn';
        restoreBtn.title = 'Restore to Board';
        restoreBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        restoreBtn.addEventListener('click', async () => {
            await api.restoreTask(task.id);
            loadArchive(archiveDateFilter.value);
            state.loadTasks();
        });
        actionsDiv.appendChild(restoreBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.title = 'Delete Permanently';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to permanently delete this task?')) {
                await api.deleteTask(task.id);
                loadArchive(archiveDateFilter.value);
                state.loadTasks();
            }
        });
        actionsDiv.appendChild(deleteBtn);
        
        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);
        archiveList.appendChild(div);
    });
}
