const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('frota',{
 api:(path,method,data)=>ipcRenderer.invoke('api',path,method,data),
 config:()=>ipcRenderer.invoke('config'),setTheme:theme=>ipcRenderer.invoke('theme',theme),configure:url=>ipcRenderer.invoke('configure',url),
 notify:count=>ipcRenderer.invoke('notify',count),seed:()=>ipcRenderer.invoke('seed'),
 pdf:(html,name)=>ipcRenderer.invoke('pdf',html,name)
});
