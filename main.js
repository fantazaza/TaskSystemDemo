const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const dbHandler = require('./database')

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
  // Initialize DB in main process
  const userDataPath = app.getPath('userData');
  await dbHandler.init(userDataPath);

  // Register IPC handlers with error protection
  const wrapHandler = (name, fn) => {
    ipcMain.handle(name, async (event, ...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`IPC Handler Error [${name}]:`, error);
        throw error; // Re-throw to be caught by the renderer's try/catch
      }
    });
  };

  wrapHandler('db:getTasks', (filters) => dbHandler.getTasks(filters));
  wrapHandler('db:addTask', (task) => dbHandler.addTask(task));
  wrapHandler('db:updateTask', (task) => dbHandler.updateTask(task));
  wrapHandler('db:deleteTask', (id) => dbHandler.deleteTask(id));
  wrapHandler('db:archiveTask', (id) => dbHandler.archiveTask(id));
  wrapHandler('db:restoreTask', (id) => dbHandler.restoreTask(id));
  wrapHandler('db:clearArchive', () => dbHandler.clearArchive());
  wrapHandler('db:archiveAllDone', () => dbHandler.archiveAllDone());

  // Settings Handlers
  wrapHandler('setting:get', (key) => dbHandler.getSetting(key));
  wrapHandler('setting:set', (key, value) => dbHandler.setSetting(key, value));

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
