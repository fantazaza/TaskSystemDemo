const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Freelance Task Manager",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Remove the menu bar for a cleaner app look
  mainWindow.setMenuBarVisibility(false)

  // Maximize window on start
  mainWindow.maximize()

  // Load the index.html of the app.
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  // Provide user data path to renderer for SQLite
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData')
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
