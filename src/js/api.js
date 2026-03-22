import { showErrorNotification } from './validation.js';

export async function getTasks(filters = {}) {
    try {
        return await window.electronAPI.getTasks(filters);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to fetch tasks.");
        return [];
    }
}

export async function addTask(taskData) {
    try {
        return await window.electronAPI.addTask(taskData);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to add task.");
        throw error;
    }
}

export async function updateTask(taskData) {
    try {
        return await window.electronAPI.updateTask(taskData);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to update task.");
        throw error;
    }
}

export async function deleteTask(id) {
    try {
        return await window.electronAPI.deleteTask(id);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to delete task.");
        throw error;
    }
}

export async function archiveTask(id) {
    try {
        return await window.electronAPI.archiveTask(id);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to archive task.");
        throw error;
    }
}

export async function restoreTask(id) {
    try {
        return await window.electronAPI.restoreTask(id);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to restore task.");
        throw error;
    }
}

export async function clearArchive() {
    try {
        return await window.electronAPI.clearArchive();
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to clear archive.");
        throw error;
    }
}

export async function archiveAllDone() {
    try {
        return await window.electronAPI.archiveAllDone();
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to archive all completed tasks.");
        throw error;
    }
}
