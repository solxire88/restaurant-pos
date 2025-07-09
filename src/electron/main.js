// src/electron/main.js
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { initDatabase } from './database.js';
import { registerIpcHandlers } from './ipcHandlers.js';

if (started) {
  app.quit();
}


app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('disable-features', 'FormControlsRefresh');
app.commandLine.appendSwitch('disable-color-correct-rendering');

console.log(process.versions.chrome);
console.log(process.versions.electron);


async function createWindow() {
  // 1) Initialize the database, bail out if it fails
  const dbSuccess = await initDatabase();
  if (!dbSuccess) {
    console.error('Failed to initialize database. Application may not work correctly.');
  }

  // 2) Register ALL ipcMain handlers now that `dbInitialized` is set
  registerIpcHandlers();

  // 3) Create the BrowserWindow as before
  const mainWindow = new BrowserWindow({
    title: 'Point Of Sale',
    width: 1280,
    height: 600,
    minWidth: 1280,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      zoomFactor: 0.8,
    }
  });

  // 4) Load either dev server URL or the built index.html
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  mainWindow.maximize();

}



app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
