// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessageToMainProcess: async (channel: string, payload: unknown) =>
    await ipcRenderer.invoke(channel, payload),
});
