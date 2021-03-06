// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');

const resizer = require('./resizer');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 240,
        height: 320,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    nativeTheme.themeSource = 'light';

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。
ipcMain.on('drop-files-and-folders', async (event, payload) => {
    await resizer.handle(payload);
    event.reply('drop-files-and-folders');
});
