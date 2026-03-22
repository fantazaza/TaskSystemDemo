const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getTasks: (filters) => ipcRenderer.invoke('db:getTasks', filters),
    addTask: (task) => ipcRenderer.invoke('db:addTask', task),
    updateTask: (task) => ipcRenderer.invoke('db:updateTask', task),
    deleteTask: (id) => ipcRenderer.invoke('db:deleteTask', id),
    archiveTask: (id) => ipcRenderer.invoke('db:archiveTask', id),
    restoreTask: (id) => ipcRenderer.invoke('db:restoreTask', id),
    clearArchive: () => ipcRenderer.invoke('db:clearArchive'),
    archiveAllDone: () => ipcRenderer.invoke('db:archiveAllDone'),
    
    // Settings API
    getSetting: (key) => ipcRenderer.invoke('getSetting', key),
    setSetting: (key, value) => ipcRenderer.invoke('setSetting', key, value),
    
    // Legacy/Internal Prefix versions (to support existing internal code)
    'setting:get': (key) => ipcRenderer.invoke('getSetting', key),
    'setting:set': (key, value) => ipcRenderer.invoke('setSetting', key, value)
});
