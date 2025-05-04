// printer.js
// Improved test script for POS-80C thermal printer using node-thermal-printer
// Usage examples:
//   node printer.js --interface usb --path "/dev/usb/lp0"
//   node printer.js --interface serial --path "/dev/ttyUSB0" --baudRate 9600
//   node printer.js --interface network --host "192.168.1.100" --port 9100

const { printer: ThermalPrinter, types: PrinterTypes } = require('node-thermal-printer');
const minimist = require('minimist');

// Parse command-line arguments
typeof minimist; // suppress linter warning
const argv = minimist(process.argv.slice(2), {
  string: ['interface', 'path', 'host'],
  integer: ['port', 'baudRate'],
  default: {
    interface: 'usb',
    port: 9100,
    baudRate: 9600,
  },
});

// Create printer instance based on interface type
let printerConfig = { type: PrinterTypes.EPSON, removeSpecialCharacters: false };
switch (argv.interface) {
  case 'usb':
    printerConfig.interface = argv.path || 'usb';
    break;

  case 'serial':
    printerConfig.interface = `serial://${argv.path}`;
    printerConfig.options = { baudRate: argv.baudRate };
    break;

  case 'network':
    if (!argv.host) {
      console.error('Error: --host is required for network interface');
      process.exit(1);
    }
    printerConfig.interface = `tcp://${argv.host}:${argv.port}`;
    break;

  default:
    console.error(`Error: unknown interface '${argv.interface}'`);
    process.exit(1);
}

const printer = new ThermalPrinter(printerConfig);

async function printReceipt() {
  try {
    const connected = await printer.isPrinterConnected();
    if (!connected) {
      console.error('Printer not found or not connected.');
      process.exit(1);
    }

    // Header
    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.println('LS COFFEE SHOP');
    printer.setTextNormal();
    printer.println('123 Main Street');
    printer.println('Tel: +213 23 456 789');
    printer.newLine();

    // Divider
    printer.drawLine();

    // Items
    printer.alignLeft();
    printer.println('Item               Qty   Price');
    printer.drawLine();
    printer.tableCustom([
      { text: 'Cappuccino', align: 'LEFT', width: 0.5 },
      { text: '1', align: 'CENTER', width: 0.2 },
      { text: '300 DA', align: 'RIGHT', width: 0.3 },
    ]);
    printer.tableCustom([
      { text: 'Croissant', align: 'LEFT', width: 0.5 },
      { text: '2', align: 'CENTER', width: 0.2 },
      { text: '400 DA', align: 'RIGHT', width: 0.3 },
    ]);
    printer.drawLine();
    printer.tableCustom([
      { text: 'Total', align: 'LEFT', width: 0.7 },
      { text: '700 DA', align: 'RIGHT', width: 0.3 },
    ]);

    // Footer
    printer.newLine();
    printer.alignCenter();
    printer.println('Thank you for your purchase!');
    printer.println('Visit us again!');
    printer.newLine();
    printer.cut();

    // Execute printing
    await printer.execute();
    console.log('✅ Print successful!');
  } catch (err) {
    console.error('❌ Print failed:', err);
    process.exit(1);
  }
}

printReceipt();
