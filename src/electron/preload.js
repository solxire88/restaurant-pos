import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  fetchMenu:    () => ipcRenderer.invoke('menu:fetch'),
  createMenu:   data => ipcRenderer.invoke('menu:create', data),
  deleteMenu:   id   => ipcRenderer.invoke('menu:delete', id),
  updateMenu:   data => ipcRenderer.invoke('menu:update', data),
  fetchStaff:      () => ipcRenderer.invoke('staff:fetch'),
  createStaff:     data => ipcRenderer.invoke('staff:create', data),
  deleteStaff:     id   => ipcRenderer.invoke('staff:delete', id),
  fetchExpenses:       () => ipcRenderer.invoke('expense:fetch'),
  createExpense:       data => ipcRenderer.invoke('expense:create', data),
  updateExpenseStatus: (id, status) => ipcRenderer.invoke('expense:updateStatus', { id, status }),
  printReceipt: (data) => ipcRenderer.invoke('print-receipt', data),
  });

contextBridge.exposeInMainWorld('printer', {
  printReceipt: (data) => ipcRenderer.invoke('print-receipt', data),
});