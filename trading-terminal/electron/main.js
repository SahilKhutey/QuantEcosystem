const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let tray;

// ─── Security: disable navigation to external URLs ───────────────────────────
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Allow external links to open in the browser
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1440,
    height:          900,
    minWidth:        360,   // Mobile-friendly minimum
    minHeight:       600,
    backgroundColor: '#0a0d14',
    icon:            path.join(__dirname, '../public/icon-512.png'),
    titleBarStyle:   process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show:            false, // Show once ready to avoid flash
    webPreferences: {
      nodeIntegration:     false,
      contextIsolation:    true,
      preload:             path.join(__dirname, 'preload.js'),
      webSecurity:         !isDev,
      allowRunningInsecureContent: isDev,
    },
  });

  // ── Load URL ──────────────────────────────────────────────────────────────
  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  // ── Window events ─────────────────────────────────────────────────────────
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // ── Application menu ──────────────────────────────────────────────────────
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'New Window', accelerator: 'CmdOrCtrl+N', click: createWindow },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        isDev ? { role: 'toggleDevTools' } : null,
      ].filter(Boolean),
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open on Web',
          click: () => shell.openExternal('http://localhost:5000'),
        },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/SahilKhutey/QuantEcosystem'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // ── System Tray ───────────────────────────────────────────────────────────
  createTray();
}

function createTray() {
  const iconPath  = path.join(__dirname, '../public/icon-512.png');
  const rawIcon   = nativeImage.createFromPath(iconPath);
  const trayIcon  = rawIcon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('Quantum Terminal — Institutional Trading');

  const menu = Menu.buildFromTemplate([
    { label: 'Open Terminal',  click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: 'separator' },
    { label: 'Backend Status', click: () => shell.openExternal('http://localhost:5000/health') },
    { type: 'separator' },
    { label: 'Quit',           click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  tray.on('click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS, keep app running in tray
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow?.show();
});

// ─── IPC ─────────────────────────────────────────────────────────────────────
ipcMain.handle('get-app-info', () => ({
  version:  app.getVersion(),
  name:     'Quantum Terminal',
  platform: process.platform,
  isDev,
}));

ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
