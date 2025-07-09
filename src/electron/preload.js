// src/electron/preload.js
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Menu
  fetchMenu: () => ipcRenderer.invoke('menu:fetch'),
  createMenu: ({ name, category, price, description, isPizza }) =>
    ipcRenderer.invoke('menu:create', { name, category, price, description, isPizza }),
  deleteMenu: id => ipcRenderer.invoke('menu:delete', id),
  updateMenu: ({ id, name, category, price, description, isPizza }) =>
    ipcRenderer.invoke('menu:update', { id, name, category, price, description, isPizza }),

  // Staff
  fetchStaff: () => ipcRenderer.invoke('staff:fetch'),
  createStaff: data => ipcRenderer.invoke('staff:create', data),
  deleteStaff: id => ipcRenderer.invoke('staff:delete', id),

  // Expenses
  fetchExpenses: () => ipcRenderer.invoke('expense:fetch'),
  createExpense: data => ipcRenderer.invoke('expense:create', data),
  updateExpenseStatus: (id, status) => ipcRenderer.invoke('expense:updateStatus', { id, status }),
  deleteExpense: id => ipcRenderer.invoke('expense:delete', id),


  // Printing
  printReceipt: data => ipcRenderer.invoke('print-receipt', data),
  printTableTicket: (tableNumber, count) =>
    ipcRenderer.invoke('print-table-ticket', { tableNumber, count }),
  printTableChef: (tableNumber, items, count) =>
    ipcRenderer.invoke('print-table-chef', { tableNumber, items, count }),
  printTableCustomer: (tableNumber, items, count) =>
    ipcRenderer.invoke('print-table-customer', { tableNumber, items, count }),

  // Settings
  fetchSettings: () => ipcRenderer.invoke('settings:fetch'),
  updateSettings: data => ipcRenderer.invoke('settings:update', data),

  // Order Count
  fetchOrderCount: () => ipcRenderer.invoke('orderCount:fetch'),
  incrementOrderCount: () => ipcRenderer.invoke('orderCount:increment'),
  resetOrderCount: () => ipcRenderer.invoke('orderCount:reset'),

  // Password (owner access)
  fetchPassword: () => ipcRenderer.invoke('password:fetch'),
  updatePassword: newPass => ipcRenderer.invoke('password:update', newPass),

  // Daily Total & Sales Records
  fetchDailyTotal: () => ipcRenderer.invoke('dailyTotal:fetch'),
  incrementDailyTotal: amount => ipcRenderer.invoke('dailyTotal:increment', amount),
  resetDailyTotal: () => ipcRenderer.invoke('dailyTotal:reset'),
  fetchSalesRecords: () => ipcRenderer.invoke('salesRecords:fetch'),


  createTableOrder: ({ tableNumber, items, bill, count }) =>
    ipcRenderer.invoke('tableOrders:create', { tableNumber, items, bill, count }),

  fetchTableOrders: () =>
    ipcRenderer.invoke('tableOrders:fetch'),

  deleteTableOrder: orderId =>
    ipcRenderer.invoke('tableOrders:delete', orderId),

  //quit
  quitApp: () => ipcRenderer.invoke('app:quit'),

});

contextBridge.exposeInMainWorld('printer', {
  printReceipt: data => ipcRenderer.invoke('print-receipt', data),
});
