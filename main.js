const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const express = require('express');
const server = express();
const PORT = 3123;

server.use(express.static(path.join(__dirname, 'app')));
let httpServer;

function createWindow () {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    title: 'Storyline Course'
  });

  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  win.loadURL(`http://localhost:${PORT}/story.html`);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://localhost:${PORT}`)) {
      shell.openExternal(url); return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  httpServer = server.listen(PORT, () => console.log(`Server on ${PORT}`));
  createWindow();
});
app.on('window-all-closed', () => { if (httpServer) httpServer.close(); app.quit(); });
