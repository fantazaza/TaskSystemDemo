import { state } from '../state.js';
import * as api from '../api.js';
import { openEditModal, openModal } from './modal.js';

let calendarDate = new Date();

export function initCalendar() {
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar(state.tasks);
    });
    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar(state.tasks);
    });
    document.getElementById('todayBtn').addEventListener('click', () => {
        calendarDate = new Date();
        renderCalendar(state.tasks);
    });

    state.subscribe(renderCalendar);
}

function renderCalendar(tasks) {
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonth = document.getElementById('calendarMonth');
    if (!calendarDays) return; 
    
    calendarDays.innerHTML = ''; 
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarDate);
    if(calendarMonth) calendarMonth.textContent = monthName;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.appendChild(createDayElement(prevMonthDays - i, true, false, tasks));
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        calendarDays.appendChild(createDayElement(i, false, isToday, tasks));
    }

    const totalCells = 42;
    const remainingCells = totalCells - calendarDays.children.length;
    for (let i = 1; i <= remainingCells; i++) {
        calendarDays.appendChild(createDayElement(i, true, false, tasks));
    }
}

function createDayElement(dayNumber, isOtherMonth, isToday, tasks) {
    const div = document.createElement('div');
    div.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
    
    const year = calendarDate.getFullYear();
    const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
    const day = String(dayNumber).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    
    div.setAttribute('data-date', fullDate);

    const numDiv = document.createElement('div');
    numDiv.className = 'day-number';
    numDiv.textContent = dayNumber;
    div.appendChild(numDiv);

    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'calendar-tasks';
    div.appendChild(tasksContainer);
    
    if (!isOtherMonth) {
        const dayTasks = tasks.filter(t => {
            if (!t.deadline) return false;
            // Normalize dates to YYYY-MM-DD for comparison
            const taskDate = new Date(t.deadline);
            if (isNaN(taskDate.getTime())) return t.deadline === fullDate;
            const normalizedTaskDate = taskDate.toISOString().split('T')[0];
            return normalizedTaskDate === fullDate && t.status !== 'archived';
        });
        
        dayTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `cal-task-item cal-task-${task.status}`;
            taskItem.textContent = task.title; // XSS Safe
            taskItem.title = task.title;
            taskItem.setAttribute('draggable', 'true');
            taskItem.setAttribute('data-id', task.id);
            
            if (task.color) {
                taskItem.style.borderLeftColor = task.color;
                taskItem.style.backgroundColor = task.color + '22';
            }

            taskItem.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(task);
            });

            taskItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', task.id);
                window.draggedTaskId = task.id;
                setTimeout(() => taskItem.style.opacity = '0.4', 0);
            });
            taskItem.addEventListener('dragend', () => taskItem.style.opacity = '1');

            tasksContainer.appendChild(taskItem);
        });

        div.addEventListener('click', () => {
            const inputDeadline = document.getElementById('taskDeadline');
            if (inputDeadline) inputDeadline.value = fullDate;
            openModal(false);
        });
        
        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            div.classList.add('drag-over-cal');
        });
        
        div.addEventListener('dragleave', () => div.classList.remove('drag-over-cal'));
        
        div.addEventListener('drop', async (e) => {
            e.preventDefault();
            div.classList.remove('drag-over-cal');
            
            const taskId = e.dataTransfer.getData('text/plain') || window.draggedTaskId;
            if (!taskId) return;

            await api.updateTask({ id: taskId, deadlineOnly: true, deadline: fullDate });
            state.loadTasks();
        });
    }
    
    return div;
}

export { renderCalendar };
