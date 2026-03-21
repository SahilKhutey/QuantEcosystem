const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  onMarketData: (callback) => ipcRenderer.on('market-data', callback),
  removeMarketDataListener: () => ipcRenderer.removeAllListeners('market-data')
});
