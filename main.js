const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
  // win.webContents.openDevTools({ mode: "undocsked" });

  ipcMain.on("select-dirs", async (event, arg) => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory"],
        message: "select output directory",
      });
      console.log("directories selected", result.filePaths);
      event.reply("dir-selected", result.filePaths[0]);
    } catch (e) {
      console.error(e);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
