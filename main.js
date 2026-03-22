const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const dbHandler = require('./database')
const googleCalendar = require('./googleCalendar')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Freelance Task Manager",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Remove the menu bar for a cleaner app look
  mainWindow.setMenuBarVisibility(false)

  // Maximize window on start
  mainWindow.maximize()

  // Load the index.html of the app.
  mainWindow.loadFile('index.html')
}

app.whenReady().then(async () => {
  // Initialize DB and Google Calendar in main process
  const userDataPath = app.getPath('userData');
  await dbHandler.init(userDataPath);
  googleCalendar.init(userDataPath);

  // Register IPC handlers
  ipcMain.handle('db:getTasks', async (event, filters) => dbHandler.getTasks(filters));
  ipcMain.handle('db:addTask', async (event, task) => dbHandler.addTask(task));
  ipcMain.handle('db:updateTask', async (event, task) => dbHandler.updateTask(task));
  ipcMain.handle('db:deleteTask', async (event, id) => dbHandler.deleteTask(id));
  ipcMain.handle('db:archiveTask', async (event, id) => dbHandler.archiveTask(id));
  ipcMain.handle('db:restoreTask', async (event, id) => dbHandler.restoreTask(id));
  ipcMain.handle('db:clearArchive', async (event) => dbHandler.clearArchive());
  ipcMain.handle('db:archiveAllDone', async (event) => dbHandler.archiveAllDone());

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
