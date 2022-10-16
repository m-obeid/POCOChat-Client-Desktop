// Electron preload for stuff
const {contextBridge, ipcRenderer } = require('electron')

window.onload = () => {
    window.document.querySelector(".upper-navbar").setAttribute("style", "-webkit-app-region: drag"); // enable dragging
    if (process.platform != 'darwin') window.document.querySelector(".window-controls").classList.remove("d-none");
}

contextBridge.exposeInMainWorld(
    'electron',
    {
      notificationHandler: (lastMsg) => ipcRenderer.send('notification-handle', lastMsg),
      minimize: () => ipcRenderer.send('window-control-press', 'minimize'),
      toggleMaxMin: () => ipcRenderer.send('window-control-press', 'maximizeMinimize'),
      close: () => ipcRenderer.send('window-control-press', 'close')
    }
)