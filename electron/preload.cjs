const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("teleprompterDesktop", {
  isDesktop: true,
  getMediaAccess: () => ipcRenderer.invoke("get-media-access"),
  saveRecording: (payload) => ipcRenderer.invoke("save-recording", payload),
  revealInFinder: (filePath) => ipcRenderer.invoke("reveal-in-finder", filePath),
  onMediaAccess: (callback) => {
    const listener = (_event, access) => callback(access);
    ipcRenderer.on("media-access", listener);
    return () => ipcRenderer.removeListener("media-access", listener);
  },
});
