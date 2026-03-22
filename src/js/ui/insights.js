import { state, formatCurrency } from '../state.js';
import * as api from '../api.js';
import { STATUS_COLORS, TASK_STATUSES } from '../constants.js';
import { showErrorNotification } from '../validation.js';

let currentPeriod = 'all';

export function initInsights() {
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.getAttribute('data-period');
            updateInsights();
        });
    });

    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportTasksToCSV);
    
    state.subscribe(updateInsights);
}

export async function updateInsights(allTasks = state.tasks) {
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let filteredTasks = allTasks;
    
    if (currentPeriod !== 'all') {
        filteredTasks = allTasks.filter(t => {
            const created = new Date(t.createdAt);
            if (isNaN(created.getTime())) return true; // Fallback: Show if date is invalid to avoid hiding data
            if (currentPeriod === 'today') return created >= startOfToday;
            if (currentPeriod === 'week') return created >= startOfWeek;
            if (currentPeriod === 'month') return created >= startOfMonth;
            if (currentPeriod === 'year') return created >= startOfYear;
            return true;
        });
    }

    const doneTasks = filteredTasks.filter(t => t.status === 'done' || t.status === 'archived');
    const activeTasks = filteredTasks.filter(t => t.status === 'todo' || t.status === 'inprogress');
    
    const earnedRev = doneTasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
    const pendingRev = activeTasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
    
    document.getElementById('statEarnedRevenue').textContent = formatCurrency(earnedRev);
    document.getElementById('statPendingRevenue').textContent = formatCurrency(pendingRev);
    
    const statTasksDone = document.getElementById('statTasksDone');
    statTasksDone.innerHTML = '';
    statTasksDone.textContent = `${doneTasks.length} `;
    const span = document.createElement('span');
    span.textContent = 'tasks';
    statTasksDone.appendChild(span);
    
    const rate = filteredTasks.length > 0 ? Math.round((doneTasks.length / filteredTasks.length) * 100) : 0;
    document.getElementById('statSuccessRate').textContent = `${rate}%`;

    const statusStack = document.getElementById('statusStack');
    const statusLegend = document.getElementById('statusLegend');
    
    if (!statusStack || !statusLegend) return;
    
    statusStack.innerHTML = '';
    statusLegend.innerHTML = '';
    
    const statusGroups = TASK_STATUSES;
    const colors = STATUS_COLORS;
    
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
        
        const legItem = document.createElement('div');
        legItem.className = 'legend-item';
        
        const legDot = document.createElement('span');
        legDot.className = 'legend-dot';
        legDot.style.backgroundColor = colors[status];
        
        const textSpan = document.createElement('span');
        textSpan.textContent = legendLabel;
        
        legItem.appendChild(legDot);
        legItem.appendChild(textSpan);
        
        statusLegend.appendChild(legItem);
    });

    const revenueBreakdown = document.getElementById('revenueBreakdown');
    if (revenueBreakdown) {
        revenueBreakdown.innerHTML = '';
        statusGroups.forEach(status => {
            const groupTasks = filteredTasks.filter(t => t.status === status);
            const groupRev = groupTasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
            
            const revRow = document.createElement('div');
            revRow.className = 'revenue-row';
            
            const revLabel = document.createElement('div');
            revLabel.className = 'rev-label';
            
            const legendDot = document.createElement('span');
            legendDot.className = 'legend-dot';
            legendDot.style.backgroundColor = colors[status];
            
            revLabel.appendChild(legendDot);
            revLabel.appendChild(document.createTextNode(' ' + status.charAt(0).toUpperCase() + status.slice(1)));
            
            const revValue = document.createElement('div');
            revValue.className = 'rev-value';
            revValue.textContent = formatCurrency(groupRev);
            
            revRow.appendChild(revLabel);
            revRow.appendChild(revValue);
            
            revenueBreakdown.appendChild(revRow);
        });
    }
}

function escapeCSV(str) {
    if (!str) return '';
    str = str.toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

async function exportTasksToCSV() {
    const btn = document.getElementById('exportCsvBtn');
    let originalText = 'Export to CSV';
    if (btn) {
        originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting...';
    }

    try {
        const allTasks = await api.getTasks({});
        if (allTasks.length === 0) {
            showErrorNotification('No tasks to export.');
            return;
        }

        const headers = ["ID", "Title", "Description", `Price (${state.currency})`, "Deadline", "Status", "Created At", "Color"];
        const rows = allTasks.map(t => [
            escapeCSV(t.id),
            escapeCSV(t.title),
            escapeCSV(t.description),
            escapeCSV(t.price || 0),
            escapeCSV(t.deadline || 'N/A'),
            escapeCSV(t.status),
            escapeCSV(t.createdAt),
            escapeCSV(t.color || '#5c9e78')
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
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}
