// preload.js

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');

const vaildOutChannel = ['drop-files-and-folders'];
const vaildInChannel = ['drop-files-and-folders'];

contextBridge.exposeInMainWorld('ipc', {
    send: (channel, payload) => {
        if (vaildOutChannel.includes(channel)) {
            ipcRenderer.send(channel, payload);
        }
    },
    listen: (channel, callback) => {
        if (vaildInChannel.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
});
