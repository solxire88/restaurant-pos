import { app } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

// Exported “live” references:
export let db = null;
export let dbInitialized = false;

/**
 * Initializes LowDB, backfills any missing fields in `db.data`,
 * and writes defaults if needed. Sets `dbInitialized = true` on success.
 */
export async function initDatabase() {
  try {
    // 1) Build the file path under userData, e.g. “.../db.json”
    const file = join(app.getPath('userData'), 'db.json');
    const adapter = new JSONFile(file);

    // 2) Create a new Low instance, giving it our default shape
    db = new Low(adapter, {
      menu: [],
      staff: [],
      expenses: [],
      settings: {
        printerMode: 'single',
        ethernetConfig: { ip: '', port: 9100, encoding: 'GB18030' },
        restaurantName: 'Best Brothers',
        restaurantPhone: '0792 68 43 23',
        password: 'admin'   // default password
      },
      orderCount: 0,
      dailyTotal: 0,       // tracks today's sum
      salesRecords: [],
      tableOrders: [] 
    });

    await db.read();

    // 3) If there was no existing data file, db.data is null
    if (!db.data) db.data = {};

    // 4) Ensure each top‐level collection exists
    if (!db.data.menu) db.data.menu = [];
    if (!db.data.staff) db.data.staff = [];
    if (!db.data.expenses) db.data.expenses = [];
    if (!db.data.tableOrders) db.data.tableOrders = []; 

   // 4.1) Backfill existing menu items to have an `isPizza` flag
   db.data.menu = db.data.menu.map(item => ({
     ...item,
     // if they already had an isPizza field (future upgrade), preserve it
     isPizza: typeof item.isPizza === 'boolean' ? item.isPizza : false,
   }));


    // 5) Backfill “settings” if missing or missing sub‐fields
    if (!db.data.settings) {
      db.data.settings = {
        printerMode: 'single',
        ethernetConfig: { ip: '', port: 9100, encoding: 'GB18030' },
        restaurantName: 'Best Brothers',
        restaurantPhone: '0662 11 87 26',
        password: 'admin'
      };
    } else {
      if (!('printerMode' in db.data.settings)) {
        db.data.settings.printerMode = 'single';
      }
      if (!db.data.settings.ethernetConfig) {
        db.data.settings.ethernetConfig = { ip: '', port: 9100, encoding: 'GB18030' };
      } else {
        if (!('ip' in db.data.settings.ethernetConfig)) {
          db.data.settings.ethernetConfig.ip = '';
        }
        if (!('port' in db.data.settings.ethernetConfig)) {
          db.data.settings.ethernetConfig.port = 9100;
        }
        if (!('encoding' in db.data.settings.ethernetConfig)) {
          db.data.settings.ethernetConfig.encoding = 'GB18030';
        }
      }
      if (!('restaurantName' in db.data.settings)) {
        db.data.settings.restaurantName = 'Best Brothers';
      }
      if (!('restaurantPhone' in db.data.settings)) {
        db.data.settings.restaurantPhone = '0792 68 43 23';
      }
      if (!('password' in db.data.settings)) {
        db.data.settings.password = 'admin';
      }
    }

    // 6) Ensure “orderCount” always exists
    if (!('orderCount' in db.data)) {
      db.data.orderCount = 1;
    }

    // 7) Ensure “dailyTotal” always exists
    if (!('dailyTotal' in db.data)) {
      db.data.dailyTotal = 0;
    }

    // 8) Ensure “salesRecords” always exists
    if (!('salesRecords' in db.data)) {
      db.data.salesRecords = [];
    }

    // 9) Persist any new fields we just back‐filled
    await db.write();
    dbInitialized = true;
    console.log('→ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('→ Database initialization error:', error);
    dbInitialized = false;
    return false;
  }
}
