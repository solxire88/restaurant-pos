// src/electron/printHelpers.js
import escpos from 'escpos';
import USB from 'escpos-usb';
import NetworkAdapter from 'escpos-network';

// Attach device classes to escpos
escpos.USB = USB;

// Extend Printer prototype to set encoding
escpos.Printer.prototype.encode = function (encoding) {
  this.device.encoding = encoding;
  return this;
};

/**
 * Helper: Print header (restaurant name, phone, title, order/table info)
 * @param {Printer} printer - escpos Printer instance
 * @param {string} restaurantName - Nom du restaurant
 * @param {string} restaurantPhone - Numéro de téléphone
 * @param {string} title - Titre du ticket (e.g., "Ticket Table", "Ticket Cuisine", "Ticket Client")
 * @param {number|string} orderCount - Numéro de commande
 * @param {number|string} [tableNumber] - Numéro de table (si applicable)
 */
function printHeader(printer, restaurantName, restaurantPhone, title, orderCount, tableNumber) {
  // generate formatted date/time
  const now = new Date();
  const two = n => n.toString().padStart(2, '0');
  const dateStr = [
    two(now.getDate()),
    two(now.getMonth() + 1),
    now.getFullYear()
  ].join('/');
  const timeStr = [
    two(now.getHours()),
    two(now.getMinutes()),
    two(now.getSeconds())
  ].join(':');
  const dateTime = `${dateStr} ${timeStr}`;

  printer
    .font('A')
    .style('B')
    .size(1, 1)
    .align('ct')
    .text(restaurantName)
    .feed(1)
    .style('NORMAL')
    .size(0, 0)
    .text(`Tel : ${restaurantPhone}`)
    .feed(1)
    // inject the actual date/time here
    .text(dateTime)
    .feed(1)
    .style('B')
    .text(title)
    .feed(1)
    .align('lt');

  if (tableNumber != null) {
    printLeftRight(printer, `N Commande: ${orderCount}`, `Table: ${tableNumber}`);
  } else {
    printLeftRight(printer, `N Commande: ${orderCount}`, `A emporter`);
  }

  printer
    .feed(1)
    .align('ct')
    .drawLine()
    .feed(1)
    .align('lt')
    .style('NORMAL')
    .font('A')
    .size(0, 0);
}


/**
 * Helper: Print text left and right aligned on the same line
 * @param {Printer} printer - escpos Printer instance
 * @param {string} leftText - Texte aligné à gauche
 * @param {string} rightText - Texte aligné à droite
 * @param {number} [lineWidth=36] - Nombre de caractères par ligne
 */
function printLeftRight(printer, leftText, rightText, lineWidth = 36) {
  const spaceCount = lineWidth - leftText.length - rightText.length;
  const spaces = ' '.repeat(spaceCount > 0 ? spaceCount : 0);
  const line = `${leftText}${spaces}${rightText}`;
  printer.text(line);
}

/**
 * Prints via USB.
 * @param {Object} params
 *   - items: array of { name, quantity, price }
 *   - receiver: 'chef' | 'customer'
 *   - orderCount, restaurantName, restaurantPhone
 */
export async function printViaUsb({ items, receiver, orderCount, restaurantName, restaurantPhone }) {
  return new Promise((resolve, reject) => {
    try {
      const device  = new escpos.USB();
      const printer = new escpos.Printer(device, { encoding: 'GB18030' });

      device.open(err => {
        if (err) return reject(err);

        if (receiver === 'chef') {
          // split
          const pizzas = items.filter(i => i.isPizza);
          const others = items.filter(i => !i.isPizza);

          // 1) pizza ticket
          if (pizzas.length) {
            printHeader(printer, restaurantName, restaurantPhone, 'Ticket Pizza', orderCount, null);
            pizzas.forEach(i => {
              printer.tableCustom([
                { text: i.name,           align: 'LEFT',   width: 0.6 },
                { text: `x${i.quantity}`, align: 'CENTER', width: 0.2 }
              ], { encoding: 'GB18030' });
            });
            printer.feed(4);
            printer.cut();
            printer.feed(1);
          }

          // 2) other dishes ticket
          if (others.length) {
            printHeader(printer, restaurantName, restaurantPhone, 'Ticket Cuisine', orderCount, null);
            others.forEach(i => {
              printer.tableCustom([
                { text: i.name,           align: 'LEFT',   width: 0.6 },
                { text: `x${i.quantity}`, align: 'CENTER', width: 0.2 }
              ], { encoding: 'GB18030' });
            });
            printer.feed(4);
            printer.cut();
          }
        } else {
          // existing customer (or default) logic
          const title = receiver === 'chef' ? 'Ticket Cuisine' : 'Ticket Client';
          printHeader(printer, restaurantName, restaurantPhone, title, orderCount, null);
          items.forEach(i => {
            const cols = [
              { text: i.name, align: 'LEFT',   width: 0.6 },
              { text: `x${i.quantity}`, align: 'CENTER', width: 0.2 }
            ];
            if (receiver !== 'chef') {
              cols.push({ text: `${i.price * i.quantity} D.A`, align: 'RIGHT', width: 0.2 });
            }
            printer.tableCustom(cols, { encoding: 'GB18030' });
          });
          if (receiver === 'customer') {
            const total = items.reduce((s,i) => s + i.price*i.quantity, 0);
            printer
              .feed(1)
              .drawLine()
              .style('B')
              .tableCustom(
                [
                  { text: 'TOTAL', align: 'LEFT',   width: 0.7 },
                  { text: `${total} D.A`, align: 'RIGHT', width: 0.3 }
                ],
                { encoding: 'GB18030' }
              )
              .style('NORMAL')
              .feed(1)
              .align('ct')
              .text('Merci pour votre commande !')
              .feed(1)
              .align('lt');
          }
          printer.cut();
        }

        printer.close(err2 => err2 ? reject(err2) : resolve());
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Same logic over Ethernet
 */
export async function printViaEthernet({ items, ip, port, encoding, receiver, orderCount, restaurantName, restaurantPhone }) {
  return new Promise((resolve, reject) => {
    try {
      const device  = new NetworkAdapter(ip, port);
      const printer = new escpos.Printer(device, { encoding });

      device.open(err => {
        if (err) return reject(err);

        if (receiver === 'chef') {
          const pizzas = items.filter(i => i.isPizza);
          const others = items.filter(i => !i.isPizza);

          if (pizzas.length) {
            printHeader(printer, restaurantName, restaurantPhone, 'Ticket Pizza', orderCount, null);
            pizzas.forEach(i => {
              printer.tableCustom([
                { text: i.name,           align: 'LEFT',   width: 0.6 },
                { text: `x${i.quantity}`, align: 'CENTER', width: 0.2 }
              ], { encoding });
            });
            printer.feed(4);
            printer.cut();
            printer.feed(1);
          }

          if (others.length) {
            printHeader(printer, restaurantName, restaurantPhone, 'Ticket Cuisine', orderCount, null);
            others.forEach(i => {
              printer.tableCustom([
                { text: i.name,           align: 'LEFT',   width: 0.6 },
                { text: `x${i.quantity}`, align: 'CENTER', width: 0.2 }
              ], { encoding });
            });
            printer.feed(4);
            printer.cut();
          }

        } else {
          // same as above for customer
          const title = receiver === 'chef' ? 'Ticket Cuisine' : 'Ticket Client';
          printHeader(printer, restaurantName, restaurantPhone, title, orderCount, null);
          items.forEach(i => {
            const cols = [
              { text: i.name, align: 'LEFT',   width: 0.6 },
              { text: `x${i.quantity}`, align: 'CENTER', width: 0.2 }
            ];
            if (receiver !== 'chef') {
              cols.push({ text: `${i.price * i.quantity} D.A`, align: 'RIGHT', width: 0.3 });
            }
            printer.tableCustom(cols, { encoding });
          });
          if (receiver === 'customer') {
            const total = items.reduce((s,i) => s + i.price*i.quantity, 0);
            printer
              .feed(1)
              .drawLine()
              .style('B')
              .tableCustom(
                [
                  { text: 'TOTAL', align: 'LEFT',   width: 0.7 },
                  { text: `${total} D.A`, align: 'RIGHT', width: 0.3 }
                ],
                { encoding }
              )
              .style('NORMAL')
              .feed(1)
              .align('ct')
              .text('Merci pour votre commande !')
              .feed(1)
              .align('lt');
          }
          printer.cut();
        }

        printer.close(err2 => err2 ? reject(err2) : resolve());
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Prints a “ticket table” (just header + table#, order#) via USB.
 * @param {Object} params
 *   - tableNumber, orderCount, restaurantName, restaurantPhone
 */
export async function printTableTicket({ tableNumber, orderCount, restaurantName, restaurantPhone }) {
  return new Promise((resolve, reject) => {
    try {
      const device = new escpos.USB();
      const printer = new escpos.Printer(device, { encoding: 'GB18030' });

      device.open(err => {
        if (err) {
          reject(err);
          return;
        }

        // ─── HEADER ─────────────────────────────────────────────────
        printHeader(printer, restaurantName, restaurantPhone, 'Ticket Table', orderCount, tableNumber);
        printer.feed(2);

        // ─── CUT & CLOSE ───────────────────────────────────────────
        printer.cut();
        printer.close(err2 => (err2 ? reject(err2) : resolve()));
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Prints the chef copy for a table, either via USB or Ethernet.
 * @param {Object} params
 *   - items, tableNumber, orderCount, ip, port, encoding, useEthernet, restaurantName, restaurantPhone
 */
export async function printTableChef({
  items,
  tableNumber,
  orderCount,
  ip,
  port,
  encoding,
  useEthernet,
  restaurantName,
  restaurantPhone
}) {
  return new Promise((resolve, reject) => {
    try {
      const device = useEthernet ? new NetworkAdapter(ip, port) : new escpos.USB();
      const printer = new escpos.Printer(device, { encoding });

      device.open(err => {
        if (err) { reject(err); return; }

        // split items
        const pizzaItems = items.filter(i => i.isPizza);
        const otherItems = items.filter(i => !i.isPizza);
        console.log('Pizza items:', pizzaItems);
        console.log('Other items:', otherItems);

        // 1) Pizza ticket
        if (pizzaItems.length) {
          printHeader(printer, restaurantName, restaurantPhone, 'Ticket Pizza', orderCount, tableNumber);
          pizzaItems.forEach(item => {
            printer.tableCustom([
              { text: item.name, align: 'LEFT',   width: 0.6 },
              { text: `x${item.quantity}`, align: 'CENTER', width: 0.2 }
            ], { encoding });
          });
          printer.feed(4);
          printer.cut();
          // reopen printer for next ticket
          
          printer.feed(1);
        }

        // 2) Cuisine ticket (other dishes)
        if (otherItems.length) {
          printHeader(printer, restaurantName, restaurantPhone, 'Ticket Cuisine', orderCount, tableNumber);
          otherItems.forEach(item => {
            printer.tableCustom([
              { text: item.name, align: 'LEFT',   width: 0.6 },
              { text: `x${item.quantity}`, align: 'CENTER', width: 0.2 }
            ], { encoding });
          });
        }
        printer.feed(4);
        printer.cut();
        printer.close(err2 => (err2 ? reject(err2) : resolve()));
      });
    } catch (error) {
      reject(error);
    }
  });
}



/**
 * Prints the customer copy for a table.
 * @param {Object} params
 *   - items, tableNumber, orderCount, restaurantName, restaurantPhone
 */
export async function printTableCustomer({ items, tableNumber, orderCount, restaurantName, restaurantPhone }) {
  return new Promise((resolve, reject) => {
    try {
      const device = new escpos.USB();
      const printer = new escpos.Printer(device, { encoding: 'GB18030' });

      device.open(err => {
        if (err) {
          reject(err);
          return;
        }

        // ─── HEADER ─────────────────────────────────────────────────
        printHeader(printer, restaurantName, restaurantPhone, 'Ticket Client', orderCount, tableNumber);

        // ─── ITEMS ──────────────────────────────────────────────────
        items.forEach(item => {
          const cols = [
            { text: item.name, align: 'LEFT', width: 0.5 },
            { text: `x${item.quantity}`, align: 'CENTER', width: 0.2 },
            { text: `${(item.price * item.quantity)} D.A`, align: 'RIGHT', width: 0.3 }
          ];
          printer.tableCustom(cols, { encoding: 'GB18030' });
        });

        // ─── TOTAL ──────────────────────────────────────────────────
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        printer
          .feed(1)
          .drawLine()
          .style('B')
          .tableCustom(
            [
              { text: 'TOTAL', align: 'LEFT', width: 0.7 },
              { text: `${total} D.A`, align: 'RIGHT', width: 0.3 }
            ],
            { encoding: 'GB18030' }
          )
          .style('NORMAL')
          .feed(1)
          .align('ct')
          .text('Merci de votre visite !')
          .feed(1)
          .align('lt');

        // ─── CUT & CLOSE ───────────────────────────────────────────
        printer.cut();
        printer.close(err2 => (err2 ? reject(err2) : resolve()));
      });
    } catch (error) {
      reject(error);
    }
  });
}
