// main.js

// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: (process.platform === 'darwin' ? 'hidden': 'default')
  })

  ipcMain.on("anonfiles-url-autosubmit", (evt, url) => {
    mainWindow.webContents.executeJavaScript(`document.querySelector("#message").value="${url}";sendMessage()`);
  });

  // and load the index.html of the app.
  mainWindow.loadURL('https://chat.poco.ga');
  mainWindow.focus();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler(( {url} ) => {
    if (url === "https://anonfiles.com/") {
      const hiddenWindow = new BrowserWindow({
        show: true,
        webPreferences: {
          preload: path.join(__dirname, "preload.anonfiles.js")
        },
        icon: path.join(__dirname, "icons/icon.ico")
      });
      hiddenWindow.loadURL("https://anonfiles.com");
      return {
        action: 'deny'
      }
    }
    shell.openExternal(url);
    return {
      action: 'deny'
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.