import * as api from './api.js';

export const state = {
    tasks: [],
    listeners: [],
    currency: '$',
    
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    notify() {
        this.listeners.forEach(cb => cb(this.tasks));
    },

    async loadTasks() {
        try {
            this.tasks = await api.getTasks({}); // Fetch all tasks for all views
            this.notify();
        } catch (error) {
            console.error("Failed to load tasks:", error);
            this.tasks = []; // Reset tasks state on error
            this.notify();
        }
    },

    async loadSettings() {
        try {
            const symbol = await api.getSetting('currency');
            if (symbol) {
                this.currency = symbol;
                this.updateGlobalUI();
                this.notify();
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    },

    updateGlobalUI() {
        const budgetLabel = document.getElementById('budgetCurrency');
        if (budgetLabel) budgetLabel.textContent = this.currency;
    }
};

export function generateId() {
    try {
        return crypto.randomUUID();
    } catch (e) {
        // Fallback for older environments
        return Date.now().toString(36) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    }
}

export function formatCurrency(amount) {
    const symbol = state.currency || '$';
    if (!amount) return symbol + '0';
    return symbol + parseFloat(amount).toLocaleString('en-US');
}

export function formatDate(dateStr) {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
