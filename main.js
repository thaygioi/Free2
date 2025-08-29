const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const express = require('express');
const server = express();
const PORT = 3123;

// Phục vụ tĩnh toàn bộ nội dung Storyline trong thư mục app/
server.use(express.static(path.join(__dirname, 'app')));

let httpServer;

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    title: 'Storyline Course'
  });

  // Nếu slide đầu có âm thanh, cho phép autoplay
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

  // Mở course qua server nội bộ để tránh lỗi CORS/fetch khi chạy file://
  win.loadURL(`http://localhost:${PORT}/story.html`);

  // Link ngoài mở bằng trình duyệt hệ thống
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://localhost:${PORT}`)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  httpServer = server.listen(PORT, () => console.log(`Server on ${PORT}`));
  createWindow();
});

app.on('window-all-closed', () => {
  if (httpServer) httpServer.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
