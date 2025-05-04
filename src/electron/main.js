import { app, BrowserWindow, ipcMain } from 'electron';
import logo from '../renderer/assets/logo.png';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { nanoid } from 'nanoid';
import _ from 'lodash';
import escpos from 'escpos';
import USB from 'escpos-usb';
import iconv from 'iconv-lite';
// import usb from 'usb';
// console.log('Final usb.getDeviceList?:', typeof usb.getDeviceList);



escpos.USB = USB;

// Tell escpos to use iconv-lite
escpos.Printer.prototype.encode = function (encoding) {
  this.device.encoding = encoding;
  return this;
};



// Global database instance
let db = null;
let dbInitialized = false;

async function initDatabase() {
  try {
    const file = join(app.getPath('userData'), 'db.json');
    const adapter = new JSONFile(file);
    
    // Create the database with default values
    db = new Low(adapter, { 
      menu: [], 
      staff: [], 
      expenses: [] 
    });
    
    // Read existing data or apply defaults
    await db.read();
    
    // Make sure all collections exist
    if (!db.data) {
      db.data = {};
    }
    if (!db.data.menu) {
      db.data.menu = [];
    }
    if (!db.data.staff) {
      db.data.staff = [];
    }
    if (!db.data.expenses) {
      db.data.expenses = [];
    }
    
    // Save defaults on first run
    await db.write();
    
    // Set initialized flag
    dbInitialized = true;
    console.log('Database initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}



function registerIpcHandlers() {
  // Make sure all handlers verify the database is initialized before using it
  
  // STAFF CRUD
  ipcMain.handle('staff:fetch', async () => {
    if (!dbInitialized) {
      console.warn('Database not initialized for staff:fetch');
      return [];
    }
    try {
      await db.read();
      return db.data.staff || [];
    } catch (error) {
      console.error('Error in staff:fetch:', error);
      return [];
    }
  });

  ipcMain.handle('staff:create', async (_evt, { name, position }) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for staff:create');
      throw new Error('Database not initialized');
    }
    
    try {
      const newStaff = { id: nanoid(), name, position };
      
      // Check if db.data and db.data.staff exist before pushing
      if (!db.data) db.data = {};
      if (!db.data.staff) db.data.staff = [];
      
      db.data.staff.push(newStaff);
      await db.write();
      return newStaff;
    } catch (error) {
      console.error('Error in staff:create:', error);
      throw error;
    }
  });

  ipcMain.handle('staff:delete', async (_evt, id) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for staff:delete');
      throw new Error('Database not initialized');
    }
    
    try {
      _.remove(db.data.staff, s => s.id === id);
      // also remove their expenses
      _.remove(db.data.expenses, e => e.staffId === id);
      await db.write();
      return id;
    } catch (error) {
      console.error('Error in staff:delete:', error);
      throw error;
    }
  });

  // EXPENSE CRUD
  ipcMain.handle('expense:fetch', async () => {
    if (!dbInitialized) {
      console.warn('Database not initialized for expense:fetch');
      return [];
    }
    
    try {
      await db.read();
      return db.data.expenses || []; 
    } catch (error) {
      console.error('Error in expense:fetch:', error);
      return [];
    }
  });

  ipcMain.handle('expense:create', async (_evt, { staffId, price, description, date, status }) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for expense:create');
      throw new Error('Database not initialized');
    }
    
    try {
      const newExp = { id: nanoid(), staffId, price, description, date, status };
      
      // Check if db.data and db.data.expenses exist before pushing
      if (!db.data) db.data = {};
      if (!db.data.expenses) db.data.expenses = [];
      
      db.data.expenses.push(newExp);
      await db.write();
      return newExp;
    } catch (error) {
      console.error('Error in expense:create:', error);
      throw error;
    }
  });

  ipcMain.handle('expense:updateStatus', async (_evt, { id, status }) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for expense:updateStatus');
      throw new Error('Database not initialized');
    }
    
    try {
      const exp = db.data.expenses.find(e => e.id === id);
      if (exp) exp.status = status;
      await db.write();
      return exp;
    } catch (error) {
      console.error('Error in expense:updateStatus:', error);
      throw error;
    }
  });

  // MENU CRUD
  ipcMain.handle('menu:fetch', async () => {
    if (!dbInitialized) {
      console.warn('Database not initialized for menu:fetch');
      return [];
    }
    
    try {
      await db.read();
      return db.data.menu || [];
    } catch (error) {
      console.error('Error in menu:fetch:', error);
      return [];
    }
  });

  ipcMain.handle('menu:create', async (event, { name, category, price, description }) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for menu:create');
      throw new Error('Database not initialized');
    }
    
    try {
      const newItem = { id: nanoid(), name, category, price, description };
      
      // Check if db.data and db.data.menu exist before pushing
      if (!db.data) db.data = {};
      if (!db.data.menu) db.data.menu = [];
      
      db.data.menu.push(newItem);
      await db.write();
      return newItem;
    } catch (error) {
      console.error('Error in menu:create:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:delete', async (event, id) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for menu:delete');
      throw new Error('Database not initialized');
    }
    
    try {
      _.remove(db.data.menu, item => item.id === id);
      await db.write();
      return id;
    } catch (error) {
      console.error('Error in menu:delete:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:update', async (event, { id, ...fields }) => {
    if (!dbInitialized) {
      console.warn('Database not initialized for menu:update');
      throw new Error('Database not initialized');
    }
    
    try {
      const item = db.data.menu.find(i => i.id === id);
      if (item) Object.assign(item, fields);
      await db.write();
      return item;
    } catch (error) {
      console.error('Error in menu:update:', error);
      throw error;
    }
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  // Initialize database first and wait for it to complete
  const dbSuccess = await initDatabase();
  if (!dbSuccess) {
    console.error('Failed to initialize database. Application may not work correctly.');
  }
  
  // Register IPC handlers after database is initialized
  registerIpcHandlers();
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 600,
    minWidth: 1280,
    minHeight: 600,   
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // More secure
      contextIsolation: true, // More secure
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


// IPC handler: print to USB ESC/POS
ipcMain.handle('print-receipt', async (_, { items, receiver }) => {
  try {
    const device  = new escpos.USB();
    const printer = new escpos.Printer(device, { encoding: 'GB18030' });

    device.open(err => {
      if (err) throw err;

      // ─── HEADER ──────────────────────────────────────────────────────
      printer
        .font('A')                 // narrow, simple font
        .style('B')                // bold for title
        .size(1, 1)                // normal width, double height for emphasis
        .align('ct')
        .text('My Restaurant')     // restaurant title enlarged
        .feed(1)
        .style('NORMAL')           // back to normal weight
        .size(0, 0)                // smallest text for contact info
        .text('123 Main Street, Cityville')  // address
        .text('Tel: (012) 345‑6789')         // phone
        .feed(1)
        .drawLine()
        .feed(1);

      // ─── ITEMS ───────────────────────────────────────────────────────
      printer.style('NORMAL').font('A').size(0, 0);
      items.forEach(item => {
        const cols = [
          { text: item.name,           align: 'LEFT',  width: 0.6 },
          { text: `×${item.quantity}`, align: 'CENTER', width: 0.2 },
        ];
        if (receiver !== 'chef') {
          cols.push({
            text: `$${(item.price * item.quantity).toFixed(2)}`,
            align: 'RIGHT', width: 0.3
          });
        }
        printer.tableCustom(cols, { encoding: 'GB18030' });
      });

      // ─── TOTAL (Customer only) ──────────────────────────────────────
      if (receiver === 'customer') {
        const total = items
          .reduce((sum, i) => sum + i.price * i.quantity, 0)
          .toFixed(2);

        printer
          .feed(1)
          .drawLine()
          .style('B')               // bold total
          .tableCustom([
            { text: 'TOTAL',        align: 'LEFT',  width: 0.7 },
            { text: `$${total}`,    align: 'RIGHT', width: 0.3 },
          ], { encoding: 'GB18030' })
          .style('NORMAL')
          .feed(1)
          .align('ct')
          .text('Thank you for your order!')  // only for customer
          .feed(1);
      }

      // ─── CUT & CLOSE ─────────────────────────────────────────────────
      printer.cut().close();
    });

    return { success: true };
  } catch (error) {
    console.error('Print error:', error);
    return { success: false, message: error.message };
  }
});



