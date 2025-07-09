// src/electron/ipcHandlers.js
import { ipcMain, app } from 'electron';
import { nanoid } from 'nanoid';
import _ from 'lodash';

import { db, dbInitialized } from './database.js';
import {
  printViaUsb,
  printViaEthernet,
  printTableTicket,
  printTableChef,
  printTableCustomer
} from './printHelpers.js';

export function registerIpcHandlers() {
  // ── Password Management ───────────────────────────────────────────────────
  // Fetch the current owner password
  ipcMain.handle('password:fetch', async () => {
    if (!dbInitialized) return null;
    try {
      await db.read();
      return db.data.settings.password || null;
    } catch {
      return null;
    }
  });

  // Update to a new owner password
  ipcMain.handle('password:update', async (_evt, newPassword) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      await db.read();
      db.data.settings.password = newPassword;
      await db.write();
      return true;
    } catch (error) {
      throw error;
    }
  });

  // ── Daily Total & Sales Records ───────────────────────────────────────────
  // Fetch today's running total
  ipcMain.handle('dailyTotal:fetch', async () => {
    if (!dbInitialized) return 0;
    try {
      await db.read();
      return db.data.dailyTotal || 0;
    } catch {
      return 0;
    }
  });

  // Increment today's total by a given amount
  ipcMain.handle('dailyTotal:increment', async (_evt, amount) => {
    if (!dbInitialized) return 0;
    try {
      await db.read();
      db.data.dailyTotal = (db.data.dailyTotal || 0) + Number(amount);
      await db.write();
      return db.data.dailyTotal;
    } catch {
      return 0;
    }
  });

  // Reset today's total and archive it into salesRecords with the current date
  ipcMain.handle('dailyTotal:reset', async () => {
    if (!dbInitialized) return { success: false, message: 'DB not ready' };
    try {
      await db.read();
      const oldTotal = db.data.dailyTotal || 0;
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Archive into salesRecords
      if (!db.data.salesRecords) db.data.salesRecords = [];
      db.data.salesRecords.push({ date, total: oldTotal });

      // Keep only the last 5 entries
      if (db.data.salesRecords.length > 100) {
        db.data.salesRecords.shift(); // remove oldest
      }

      // Reset dailyTotal to zero
      db.data.dailyTotal = 0;
      await db.write();
      return { success: true, archived: { date, total: oldTotal } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });


  // Fetch all historical sales records
  ipcMain.handle('salesRecords:fetch', async () => {
    if (!dbInitialized) return [];
    try {
      await db.read();
      return db.data.salesRecords || [];
    } catch {
      return [];
    }
  });

  // ── OrderCount CRUD ──────────────────────────────────────────────────────
  ipcMain.handle('orderCount:fetch', async () => {
    if (!dbInitialized) return 0;
    try {
      await db.read();
      return db.data.orderCount || 0;
    } catch {
      return 0;
    }
  });

  ipcMain.handle('orderCount:increment', async () => {
    if (!dbInitialized) return 0;
    try {
      await db.read();
      db.data.orderCount = (db.data.orderCount || 0) + 1;
      await db.write();
      return db.data.orderCount;
    } catch {
      return 0;
    }
  });

  ipcMain.handle('orderCount:reset', async () => {
    if (!dbInitialized) return 0;
    try {
      db.data.orderCount = 1;
      await db.write();
      return 0;
    } catch {
      return 0;
    }
  });

  // ── Settings CRUD ────────────────────────────────────────────────────────
  ipcMain.handle('settings:fetch', async () => {
    if (!dbInitialized) return null;
    try {
      await db.read();
      return db.data.settings;
    } catch {
      return null;
    }
  });

  ipcMain.handle('settings:update', async (_evt, newSettings) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      db.data.settings = {
        ...db.data.settings,
        ...newSettings,
        ethernetConfig: {
          ...db.data.settings.ethernetConfig,
          ...(newSettings.ethernetConfig || {})
        }
      };
      await db.write();
      return db.data.settings;
    } catch (error) {
      throw error;
    }
  });

  // ── Menu CRUD ────────────────────────────────────────────────────────────
  ipcMain.handle('menu:fetch', async () => {
    if (!dbInitialized) return [];
    try {
      await db.read();
      return db.data.menu || [];
    } catch {
      return [];
    }
  });

  ipcMain.handle('menu:create', async (_evt, { name, category, price, description, isPizza }) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      const newItem = { id: nanoid(), name, category, price, description, isPizza: Boolean(isPizza), };
      if (!db.data.menu) db.data.menu = [];
      db.data.menu.push(newItem);
      await db.write();
      return newItem;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('menu:delete', async (_evt, id) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      _.remove(db.data.menu, item => item.id === id);
      await db.write();
      return id;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('menu:update', async (_evt, { id, ...fields }) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      const item = db.data.menu.find(i => i.id === id);
      if (item) {
       // Only copy through known fields, including isPizza
       const { name, category, price, description, isPizza } = fields;
       if (name !== undefined)        item.name = name;
       if (category !== undefined)    item.category = category;
       if (price !== undefined)       item.price = price;
       if (description !== undefined) item.description = description;
       if (isPizza !== undefined)     item.isPizza = Boolean(isPizza);
      }
      await db.write();
      return item;
    } catch (error) {
      throw error;
    }
  });

  // ── Staff CRUD ───────────────────────────────────────────────────────────
  ipcMain.handle('staff:fetch', async () => {
    if (!dbInitialized) return [];
    try {
      await db.read();
      return db.data.staff || [];
    } catch {
      return [];
    }
  });

  ipcMain.handle('staff:create', async (_evt, { name, position }) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      const newStaff = { id: nanoid(), name, position };
      if (!db.data.staff) db.data.staff = [];
      db.data.staff.push(newStaff);
      await db.write();
      return newStaff;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('staff:delete', async (_evt, id) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      _.remove(db.data.staff, s => s.id === id);
      _.remove(db.data.expenses, e => e.staffId === id);
      await db.write();
      return id;
    } catch (error) {
      throw error;
    }
  });

  // ── Expense CRUD ─────────────────────────────────────────────────────────
  ipcMain.handle('expense:fetch', async () => {
    if (!dbInitialized) return [];
    try {
      await db.read();
      return db.data.expenses || [];
    } catch {
      return [];
    }
  });

  ipcMain.handle('expense:create', async (_evt, { staffId, price, description, date, status }) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      const newExp = { id: nanoid(), staffId, price, description, date, status };
      if (!db.data.expenses) db.data.expenses = [];
      db.data.expenses.push(newExp);
      await db.write();
      return newExp;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('expense:updateStatus', async (_evt, { id, status }) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      const exp = db.data.expenses.find(e => e.id === id);
      if (exp) exp.status = status;
      await db.write();
      return exp;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('expense:delete', async (_evt, id) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    try {
      // Remove the expense with matching id
      _.remove(db.data.expenses, e => e.id === id);
      await db.write();
      return id;
    } catch (error) {
      throw error;
    }
  });

  // ── Print‐Receipt Handler ─────────────────────────────────────────────────
  ipcMain.handle('print-receipt', async (_evt, { items, receiver }) => {
    try {
      await db.read();
      const { printerMode, ethernetConfig, restaurantName, restaurantPhone } = db.data.settings;
      const orderCount = db.data.orderCount || 0;

      if (printerMode === 'single') {
        await printViaUsb({ items, receiver, orderCount, restaurantName, restaurantPhone });
      } else {
        if (receiver === 'chef') {
          await printViaEthernet({
            items,
            ip: ethernetConfig.ip,
            port: ethernetConfig.port,
            encoding: ethernetConfig.encoding,
            receiver: 'chef',
            orderCount,
            restaurantName,
            restaurantPhone
          });
        } else {
          await printViaUsb({ items, receiver: 'customer', orderCount, restaurantName, restaurantPhone });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, message: error.message };
    }
  });

  // ── Table‐Specific Print Helpers ──────────────────────────────────────────
  ipcMain.handle('print-table-ticket', async (_evt, { tableNumber, count }) => {
    if (!dbInitialized) {
      console.warn('DB not initialized for print-table-ticket');
      return { success: false, message: 'DB not ready' };
    }
    try {
      await db.read();
      const orderCount = count;
      console.log('Printing table ticket for table:', tableNumber, 'with order count:', orderCount);
      const { restaurantName, restaurantPhone } = db.data.settings;
      await printTableTicket({ tableNumber, orderCount, restaurantName, restaurantPhone });
      return { success: true };
    } catch (error) {
      console.error('Error in print-table-ticket:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('print-table-chef', async (_evt, { tableNumber, items, count }) => {
    if (!dbInitialized) {
      console.warn('DB not initialized for print-table-chef');
      return { success: false, message: 'DB not ready' };
    }
    try {
      await db.read();
      const orderCount = count;
      const { printerMode, ethernetConfig, restaurantName, restaurantPhone } = db.data.settings;
      const useEthernet = printerMode === 'dual';

      await printTableChef({
        items,
        tableNumber,
        orderCount,
        ip: ethernetConfig.ip,
        port: ethernetConfig.port,
        encoding: ethernetConfig.encoding,
        useEthernet,
        restaurantName,
        restaurantPhone
      });
      return { success: true };
    } catch (error) {
      console.error('Error in print-table-chef:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('print-table-customer', async (_evt, { tableNumber, items, count }) => {
    if (!dbInitialized) {
      console.warn('DB not initialized for print-table-customer');
      return { success: false, message: 'DB not ready' };
    }
    try {
      await db.read();
      const orderCount = count;
      const { restaurantName, restaurantPhone } = db.data.settings;
      await printTableCustomer({ tableNumber, items, orderCount, restaurantName, restaurantPhone });
      return { success: true };
    } catch (error) {
      console.error('Error in print-table-customer:', error);
      return { success: false, message: error.message };
    }
  });

  // ── Table Orders CRUD ────────────────────────────────────────────────────
  // Create a new dine-in order
  ipcMain.handle('tableOrders:create', async (_evt, { tableNumber, items, bill, count }) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    await db.read();
    const newOrder = { id: nanoid(), tableNumber, items, bill, count };
    if (!db.data.tableOrders) db.data.tableOrders = [];
    db.data.tableOrders.push(newOrder);
    // Also increment the order count
    db.data.orderCount = (db.data.orderCount || 1) + 1;
    await db.write();
    return newOrder;
  });

  // Fetch all active table orders
  ipcMain.handle('tableOrders:fetch', async () => {
    if (!dbInitialized) return [];
    await db.read();
    return db.data.tableOrders || [];
  });

  // Delete (i.e. mark paid / finished) a table order
  ipcMain.handle('tableOrders:delete', async (_evt, orderId) => {
    if (!dbInitialized) throw new Error('DB not initialized');
    await db.read();
    _.remove(db.data.tableOrders, o => o.id === orderId);
    await db.write();
    return orderId;
  });


}

ipcMain.handle('app:quit', () => {
  app.quit();
});
