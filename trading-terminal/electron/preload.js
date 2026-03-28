const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose safe APIs to the renderer (React app)
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Platform detection
  platform: process.platform,
  isElectron: true,

  // Open external links in default browser
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
