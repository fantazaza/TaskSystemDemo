import { state, generateId } from '../state.js';
import * as api from '../api.js';
import { validateTask, showErrorNotification } from '../validation.js';

const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const inputId = document.getElementById('taskId');
const inputTitle = document.getElementById('taskTitle');
const inputDesc = document.getElementById('taskDesc');
const inputPrice = document.getElementById('taskPrice');
const inputDeadline = document.getElementById('taskDeadline');
const deadlineDisplay = document.getElementById('deadlineDisplay');
const inputStatus = document.getElementById('taskStatus');
const inputColor = document.getElementById('taskColor');

export function initModal() {
    document.getElementById('addTaskBtn').addEventListener('click', () => openModal(false));
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    deleteTaskBtn.addEventListener('click', async () => {
        if (inputId.value && confirm('Are you sure you want to delete this task?')) {
            await api.deleteTask(inputId.value);
            state.loadTasks();
            closeModal();
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

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

    document.querySelectorAll('.preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.getAttribute('data-color');
            if (inputColor) inputColor.value = color;
        });
    });

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const priceValue = inputPrice.value ? parseFloat(inputPrice.value) : 0;
        
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

        const errors = validateTask(taskData);
        if (errors.length > 0) {
            showErrorNotification(errors.join("\n"));
            return;
        }

        try {
            if (inputId.value) {
                await api.updateTask(taskData);
            } else {
                await api.addTask(taskData);
            }
            state.loadTasks();
            closeModal();
        } catch (error) {
        }
    });
}

export function openModal(isEdit = false) {
    taskModal.classList.remove('hidden');
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    if (!isEdit) {
        taskForm.reset();
        inputId.value = '';
        modalTitle.textContent = 'Add New Task';
        deadlineDisplay.textContent = 'Select Deadline';
        if (deleteTaskBtn) deleteTaskBtn.classList.add('hidden');
    } else {
        modalTitle.textContent = 'Edit Task';
        if (deleteTaskBtn) deleteTaskBtn.classList.remove('hidden');
    }
}

export function closeModal() {
    taskModal.classList.add('hidden');
    setTimeout(() => taskForm.reset(), 300);
}

export function openEditModal(task) {
    inputId.value = task.id;
    inputTitle.value = task.title;
    inputDesc.value = task.description;
    inputPrice.value = task.price;
    inputDeadline.value = task.deadline || '';
    inputStatus.value = task.status;
    inputColor.value = task.color || '#5c9e78';
    
    if (task.deadline) {
        const date = new Date(task.deadline);
        deadlineDisplay.textContent = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
        deadlineDisplay.textContent = 'Select Deadline';
    }

    openModal(true);
}
