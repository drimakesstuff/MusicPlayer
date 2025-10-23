const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;
let playlistWindow;
let playlist = []; // Global playlist storage

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 450,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
}

function createPlaylistWindow() {
  if (playlistWindow) {
    playlistWindow.focus();
    return;
  }

  playlistWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  playlistWindow.loadFile('playlist.html');

  playlistWindow.on('closed', () => {
    playlistWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handler to open file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3'] }
    ]
  });
  if (result.canceled) {
    return [];
  }
  return result.filePaths;
});

// Update playlist from renderer
ipcMain.on('update-playlist', (event, newPlaylist) => {
  playlist = newPlaylist;
  // console.log('Playlist updated:', playlist);
});

// Open playlist window
ipcMain.on('open-playlist-window', () => {
  createPlaylistWindow();
});

// Send playlist data to playlist window on request
ipcMain.on('request-playlist-data', (event) => {
  event.sender.send('playlist-data', playlist);
});
