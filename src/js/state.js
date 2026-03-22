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

    async loadSettings() {
        const symbol = await api.getSetting('currency');
        if (symbol) {
            this.currency = symbol;
            this.updateGlobalUI();
            this.notify();
        }
    },

    updateGlobalUI() {
        const budgetLabel = document.getElementById('budgetCurrency');
        if (budgetLabel) budgetLabel.textContent = this.currency;
    }
};

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatCurrency(amount) {
    if (!amount) return state.currency + '0';
    return state.currency + parseFloat(amount).toLocaleString('en-US');
}

export function formatDate(dateStr) {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
