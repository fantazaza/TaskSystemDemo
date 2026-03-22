import { state } from './state.js';
import { initKanban } from './ui/kanban.js';
import { initCalendar, renderCalendar } from './ui/calendar.js';
import { initInsights, updateInsights } from './ui/insights.js';
import { initArchive } from './ui/archive.js';
import { initModal } from './ui/modal.js';

let currentView = 'kanban';

document.addEventListener('DOMContentLoaded', () => {
    initKanban();
    initCalendar();
    initInsights();
    initArchive();
    initModal();
    
    setupViewSwitch();

    state.loadTasks();
});

function setupViewSwitch() {
    const kanbanViewBtn = document.getElementById('kanbanViewBtn');
    const calendarViewBtn = document.getElementById('calendarViewBtn');
    const insightsViewBtn = document.getElementById('insightsViewBtn');
    
    const kanbanView = document.getElementById('kanbanView');
    const calendarView = document.getElementById('calendarView');
    const insightsView = document.getElementById('insightsView');

    kanbanViewBtn.addEventListener('click', () => switchView('kanban'));
    calendarViewBtn.addEventListener('click', () => switchView('calendar'));
    insightsViewBtn.addEventListener('click', () => switchView('insights'));

    function switchView(view) {
        currentView = view;
        
        kanbanViewBtn.classList.remove('active');
        calendarViewBtn.classList.remove('active');
        insightsViewBtn.classList.remove('active');
        
        kanbanView.classList.add('hidden');
        calendarView.classList.add('hidden');
        insightsView.classList.add('hidden');

        if (view === 'kanban') {
            kanbanView.classList.remove('hidden');
            kanbanViewBtn.classList.add('active');
        } else if (view === 'calendar') {
            calendarView.classList.remove('hidden');
            calendarViewBtn.classList.add('active');
            renderCalendar(state.tasks); // force re-render
        } else if (view === 'insights') {
            insightsView.classList.remove('hidden');
            insightsViewBtn.classList.add('active');
            updateInsights(); // force re-render
        }
    }
}
