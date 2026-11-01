const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  session,
  shell,
  systemPreferences,
} = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");

const isDev = !app.isPackaged;
let mainWindow = null;
let staticServer = null;
let staticPort = 0;

function createStaticServer() {
  const distDir = path.join(__dirname, "..", "dist");
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
        let filePath = path.join(
          distDir,
          urlPath === "/" ? "index.html" : urlPath.replace(/^\//, ""),
        );

        if (!filePath.startsWith(distDir)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, "index.html");
        }

        const ext = path.extname(filePath).toLowerCase();
        const types = {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".svg": "image/svg+xml",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".webp": "image/webp",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".json": "application/json",
          ".map": "application/json",
        };

        res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500);
        res.end(String(error));
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      staticPort = typeof address === "object" && address ? address.port : 0;
      staticServer = server;
      resolve(staticPort);
    });
    server.on("error", reject);
  });
}

async function ensureMacMediaAccess() {
  if (process.platform !== "darwin") return { camera: true, microphone: true };

  const camera = await systemPreferences.askForMediaAccess("camera");
  const microphone = await systemPreferences.askForMediaAccess("microphone");
  return { camera, microphone };
}

function registerPermissionHandlers() {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      if (permission === "media" || permission === "mediaKeySystem") {
        callback(true);
        return;
      }
      callback(false);
    },
  );

  session.defaultSession.setPermissionCheckHandler(
    (_webContents, permission) =>
      permission === "media" || permission === "mediaKeySystem",
  );
}

async function createWindow() {
  registerPermissionHandlers();
  const access = await ensureMacMediaAccess();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "Teleprompter Studio",
    backgroundColor: "#090b0d",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    await mainWindow.loadURL("http://127.0.0.1:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const port = await createStaticServer();
    await mainWindow.loadURL(`http://127.0.0.1:${port}`);
  }

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send("media-access", access);
  });
}

ipcMain.handle("save-recording", async (_event, payload) => {
  const { buffer, defaultName } = payload;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Opname opslaan",
    defaultPath: defaultName || "teleprompter-opname.webm",
    filters: [
      { name: "Video", extensions: ["mp4", "webm", "mov"] },
      { name: "Alle bestanden", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return { saved: false };
  }

  fs.writeFileSync(result.filePath, Buffer.from(buffer));
  return { saved: true, filePath: result.filePath };
});

ipcMain.handle("get-media-access", async () => ensureMacMediaAccess());

ipcMain.handle("reveal-in-finder", async (_event, filePath) => {
  if (filePath) shell.showItemInFolder(filePath);
});

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
  if (process.platform !== "darwin") app.quit();
});

// Silence unused import warning in some bundlers
void pathToFileURL;
