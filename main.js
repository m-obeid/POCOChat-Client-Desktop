// main.js

// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, Notification } = require('electron')
const path = require('path')

let tray;

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
  if (process.platform === 'darwin') {
    globalShortcut.register('Command+Q', () => {
        forceQuit = true;
        app.quit();
    })
  }
  tray = new Tray(path.join(__dirname, "icons/tray-icon.png"));
  tray.setToolTip("POCOChat")
  tray.on('click', (e) => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  });
  tray.on("right-click", ()=>{
    tray.popUpContextMenu(trayMenu);
  });
  let trayMenuTemplate = [
    {label: "POCOChat Desktop Beta v1", enabled: false},
    {label: "Leave POCOChat", click: () => { forceQuit = true; app.quit() }}
  ]
  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);

  ipcMain.on("anonfiles-url-autosubmit", (evt, url) => {
    mainWindow.webContents.executeJavaScript(`document.querySelector("#message").value="${url}";sendMessage()`);
  });

  ipcMain.on("notification-handle", (evt, lastMsg) => {
    if (!mainWindow.isVisible() || !mainWindow.isFocused())
    {
      if (lastMsg.type === 'text') {
        const notify = new Notification({title: lastMsg.username, body: lastMsg.html, hasReply: true, subtitle: "New message on POCOChat", silent: true});
        notify.on('click', (evt) => {
          mainWindow.show();
        })
        notify.on('reply', (evt, reply) => {
          mainWindow.webContents.executeJavaScript(`document.querySelector("#message").value=\`${reply.replace("`", "\\`")}\`;sendMessage()`);
        });
        notify.show();
      }
    }
  });

  ipcMain.on('window-control-press', (evt, control) => {
    switch (control) {
      case 'minimize':
        mainWindow.minimize()
        break;
      case 'maximizeMinimize':
        if (mainWindow.isMaximized())
          mainWindow.unmaximize();
        else
          mainWindow.maximize();
        break;
      case 'close':
        mainWindow.close()
    }
  })

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

  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if (forceQuit) return true;
      event.preventDefault()
      mainWindow.hide();

      return false;
  });
}

let forceQuit = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    if (BrowserWindow.getAllWindows().length > 0 && !BrowserWindow.getAllWindows()[0].isVisible()) BrowserWindow.getAllWindows()[0].show()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (forceQuit) app.quit(); 
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.