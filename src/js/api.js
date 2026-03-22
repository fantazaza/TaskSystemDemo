import { showErrorNotification } from './validation.js';

export async function getTasks(filters = {}) {
    try {
        return await window.electronAPI.getTasks(filters);
    } catch (error) {
        console.error("API Error [getTasks]:", error);
        showErrorNotification("Unable to load tasks from database.");
        return [];
    }
}

export async function addTask(taskData) {
    try {
        return await window.electronAPI.addTask(taskData);
    } catch (error) {
        console.error("API Error [addTask]:", error);
        showErrorNotification("Failed to save new task.");
        throw error;
    }
}

export async function updateTask(taskData) {
    try {
        return await window.electronAPI.updateTask(taskData);
    } catch (error) {
        console.error("API Error [updateTask]:", error);
        showErrorNotification("Could not update task details.");
        throw error;
    }
}

export async function deleteTask(id) {
    try {
        return await window.electronAPI.deleteTask(id);
    } catch (error) {
        console.error("API Error [deleteTask]:", error);
        showErrorNotification("Failed to permanently delete task.");
        throw error;
    }
}

export async function archiveTask(id) {
    try {
        return await window.electronAPI.archiveTask(id);
    } catch (error) {
        console.error("API Error [archiveTask]:", error);
        showErrorNotification("Could not move task to archive.");
        throw error;
    }
}

export async function restoreTask(id) {
    try {
        return await window.electronAPI.restoreTask(id);
    } catch (error) {
        console.error("API Error [restoreTask]:", error);
        showErrorNotification("Failed to restore task to active board.");
        throw error;
    }
}

export async function clearArchive() {
    try {
        return await window.electronAPI.clearArchive();
    } catch (error) {
        console.error("API Error [clearArchive]:", error);
        showErrorNotification("Emptying archive failed.");
        throw error;
    }
}

export async function archiveAllDone() {
    try {
        return await window.electronAPI.archiveAllDone();
    } catch (error) {
        console.error("API Error [archiveAllDone]:", error);
        showErrorNotification("Batch archiving failed.");
        throw error;
    }
}
