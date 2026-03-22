import * as api from './api.js';

export const state = {
    tasks: [],
    listeners: [],
    
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    notify() {
        this.listeners.forEach(cb => cb(this.tasks));
    },

    async loadTasks() {
        this.tasks = await api.getTasks({}); // Fetch all tasks for all views
        this.notify();
    }
};

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatCurrency(amount) {
    if (!amount) return '$0';
    return '$' + parseFloat(amount).toLocaleString('en-US');
}

export function formatDate(dateStr) {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
