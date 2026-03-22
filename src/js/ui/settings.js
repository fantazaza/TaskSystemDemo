import { state } from '../state.js';
import * as api from '../api.js';

const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');
const currencySetting = document.getElementById('currencySetting');

export function initSettings() {
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
    document.getElementById('cancelSettingsBtn').addEventListener('click', closeSettings);

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCurrency = currencySetting.value;
        
        try {
            await api.setSetting('currency', newCurrency);
            state.currency = newCurrency;
            state.updateGlobalUI();
            state.notify(); // Re-render everything
            closeSettings();
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
    });
}

function openSettings() {
    currencySetting.value = state.currency;
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}
