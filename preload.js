const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadConfig: () => ipcRenderer.invoke('load-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    testConnection: (config) => ipcRenderer.invoke('test-connection', config),
    runCollection: () => ipcRenderer.invoke('run-collection'),
    onLog: (callback) => ipcRenderer.on('log-message', (event, msg) => callback(msg))
});
